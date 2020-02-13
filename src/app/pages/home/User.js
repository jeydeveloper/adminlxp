import React, { useState, useEffect, Fragment } from "react";
import { Table } from "react-bootstrap";
import {
  Portlet,
  PortletBody,
  PortletHeader
} from "../../partials/content/Portlet";
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';
import {
  TextField,
  Select,
  Chip,
  MenuItem,
  Input,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  DialogContentText
} from "@material-ui/core";
import { Alert } from "react-bootstrap";
import axios from "axios";
import { FormattedMessage, injectIntl } from "react-intl";
import { connect } from "react-redux";

const { REACT_APP_API_URL } = process.env;

const useStyles = makeStyles(theme => ({
  button: {
    margin: theme.spacing(1),
  },
  formControl: {
    minWidth: 300,
    maxWidth: 400,
    marginTop: "16px",
    marginRight: "8px"
  },
  chips: {
    display: "flex",
    flexWrap: "wrap"
  },
  chip: {
    margin: 2
  }
}));

const style = {
  rowTable: { "verticalAlign": "middle" },
  fullWidth: { width: "100%" },
  textAlignCenter: { "textAlign": "center" },
  marginTopBottom: {
    marginTop: "16px",
    marginBottom: "8px"
  }
};

function User() {
  const classes = useStyles();

  const initialStateForm = {
    "fullname": "",
    "username": "",
    "email": "",
    "password": "",
    "attribute": [],
  };

  const initialStateError = {
    "fullname": false,
    "username": false,
    "email": false,
    "password": false
  };

  const requiredInput = ["fullname", "username", "email", "password"];

  const ITEM_HEIGHT = 48;
  const ITEM_PADDING_TOP = 8;
  const MenuProps = {
    PaperProps: {
      style: {
        maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
        width: 250
      }
    }
  };

  const [success, setSuccess] = useState(null);
  const [failed, setFailed] = useState(null);
  const [form, setForm] = useState(null);
  const [users, setUsers] = useState([]);
  const [values, setValues] = useState(initialStateForm);
  const [valuesError, setValuesError] = useState(initialStateError);
  const [formId, setFormId] = useState(false);
  const [attributes, setAttributes] = useState([]);
  const [attributeValue, setAttributeValue] = useState([]);
  const [attributeValueError, setAttributeValueError] = useState([]);
  const [attributeValueRequired, setAttributeValueRequired] = useState([]);
  const [message, setMessage] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    async function fetchData() {
      axios.get(`${REACT_APP_API_URL}/users`)
        .then(res => {
          // console.log(res);
          setUsers(res.data)
        })
    }
    fetchData();
    async function fetchDataAttribute() {
      axios.get(`${REACT_APP_API_URL}/attributes`)
        .then(res => {
          let dataAttributes = res.data.filter(value => value.show_for_user);
          setAttributes(dataAttributes);
          setAttributeValueRequired(dataAttributes.map(value => (value.mandatory ? true : false)));
        })
    }
    fetchDataAttribute();
  }, []);

  const editUser = (user) => {
    setValues({ ...values, ...user });
    setForm(true);
    setFormId(user._id);
    setAttributeValue(user.attribute.map(value => value.attribute_value));
  };

  const deleteUser = () => {
    let user = values;
    axios.delete(`${REACT_APP_API_URL}/users/${user._id}`)
      .then(res => {
        setUsers(users.filter(value => value._id !== user._id));
        setOpen(false);
      })
  };

  const handleChange = name => event => {
    setFailed(false);
    setSuccess(false);
    setMessage(null);
    setValues({ ...values, [name]: event.target.value });
    if (requiredInput.includes(name)) {
      if ((!event.target.value && name !== "password") || (!formId && name === "password" && !event.target.value)) {
        setValuesError({ ...valuesError, [name]: true });
      } else {
        setValuesError({ ...valuesError, [name]: false });
      }
    }
  };

  const handleAttribute = index => event => {
    setFailed(false);
    setSuccess(false);
    setMessage(null);
    let newAttributeValue = [...attributeValue];
    newAttributeValue[index] = event.target.value;
    setAttributeValue(newAttributeValue);
    if (attributeValueRequired[index]) {
      if (event.target.value) {
        setAttributeValueError({ ...attributeValueError, [index]: false });
      } else {
        setAttributeValueError({ ...attributeValueError, [index]: true });
      }
    }
  };

  const addUser = () => {
    setValues({ ...initialStateForm });
    setForm(true);
  };

  const isValidInput = () => {
    let result = true;
    let errorRequiredInput = initialStateError;
    for (let value of requiredInput) {
      if (formId && value === "password") continue;
      if (!values[value]) {
        result = false;
        errorRequiredInput[value] = true;
      }
    }
    setValuesError({ ...valuesError, ...errorRequiredInput });

    let errorRequiredInputAttribute = attributes.map((valAttribute, idxAttribute) => {
      if (valAttribute.mandatory) {
        if (attributeValue[idxAttribute]) {
          return false;
        } else {
          result = false;
          return true;
        }
      }
      return false;
    });
    setAttributeValueError({ ...attributeValueError, ...errorRequiredInputAttribute });

    return result;
  }

  const saveForm = () => {
    values.attribute = attributes.map((valAttribute, idxAttribute) => ({
      "attribute_name": valAttribute.name,
      "attribute_value": (attributeValue[idxAttribute] || "")
    }));

    if (!isValidInput()) return false;

    if (formId) {
      axios.put(`${REACT_APP_API_URL}/users/${formId}`, values)
        .then(res => {
          setUsers(users.map(value => (value._id === formId ? res.data : value)));
          setSuccess(true);
        })
        .catch(err => {
          setFailed(true);
          setMessage(err.message);
        })
    } else {
      axios.post(`${REACT_APP_API_URL}/users`, values)
        .then(res => {
          values._id = res.data._id;
          setUsers([...users, values]);
          setValues({ ...initialStateForm });
          setSuccess(true);
          clearForm();
        })
        .catch(err => {
          setFailed(true);
          setMessage(err.message);
        })
    }
  };

  const doneForm = () => {
    setForm(false);
    setSuccess(false);
    setFormId(null);
    clearForm();
  };

  const clearForm = () => {
    setValues(initialStateForm);
    setValuesError(initialStateError);
    setAttributeValue([]);
  };

  const handleClose = () => {
    setOpen(false);
  }

  const handleClickOpen = (question) => {
    setValues({ ...values, ...question });
    setOpen(true);
  }

  return (
    <>
      {form &&
        <div className="row">
          <div className="col-md-12">
            {success && (
              <Alert style={{ "marginTop": "10px" }} variant="success">
                Save data success!
            </Alert>
            )}
            {failed && (
              <Alert style={{ "marginTop": "10px" }} variant="danger">
                {message}
              </Alert>
            )}
            <Portlet>
              <PortletBody fluid={true}>
                <form style={style.fullWidth} noValidate autoComplete="off">
                  <TextField
                    id="standard-fullname"
                    label={<FormattedMessage id="USER.FULLNAME" />}
                    value={values.fullname}
                    onChange={handleChange("fullname")}
                    margin="normal"
                    fullWidth
                    required
                    error={valuesError.fullname}
                  />
                  <TextField
                    id="standard-username"
                    label={<FormattedMessage id="USER.USERNAME" />}
                    value={values.username}
                    onChange={handleChange("username")}
                    margin="normal"
                    fullWidth
                    required
                    error={valuesError.username}
                  />
                  <TextField
                    id="standard-email"
                    label={<FormattedMessage id="USER.EMAIL" />}
                    value={values.email}
                    onChange={handleChange("email")}
                    margin="normal"
                    fullWidth
                    required
                    error={valuesError.email}
                  />

                  <TextField
                    id="standard-password"
                    type="password"
                    label={<FormattedMessage id="USER.PASSWORD" />}
                    value={values.password}
                    onChange={handleChange("password")}
                    margin="normal"
                    fullWidth
                    required
                    error={valuesError.password}
                  />

                  {
                    attributes.map((valAttribute, idxAttribute) =>
                      <Fragment key={`userattribute${idxAttribute}`}>
                        {valAttribute.type === "date" &&
                          <TextField
                            value={attributeValue[idxAttribute] || ""}
                            type="date"
                            label={valAttribute.name}
                            onChange={handleAttribute(idxAttribute)}
                            margin="normal"
                            fullWidth
                            InputLabelProps={{
                              shrink: true
                            }}
                            error={attributeValueError[idxAttribute] || false}
                            required={attributeValueRequired[idxAttribute] || false}
                          />
                        }
                        {valAttribute.type === "text" &&
                          <TextField
                            value={attributeValue[idxAttribute] || ""}
                            label={valAttribute.name}
                            onChange={handleAttribute(idxAttribute)}
                            margin="normal"
                            fullWidth
                            error={attributeValueError[idxAttribute] || false}
                            required={attributeValueRequired[idxAttribute] || false}
                          />
                        }
                        {valAttribute.type === "list" &&
                          <div>
                            <FormControl className={classes.formControl} error={attributeValueError[idxAttribute] || false} required={attributeValueRequired[idxAttribute] || false}>
                              <InputLabel>{valAttribute.name}</InputLabel>
                              <Select
                                key={`sel2${idxAttribute}`}
                                value={attributeValue[idxAttribute] || ""}
                                onChange={handleAttribute(idxAttribute)}
                                displayEmpty
                                name="attributevalue"
                              >
                                {valAttribute.value.map((valAttributeValue, indexAttributeValue) =>
                                  <MenuItem key={`attr2${indexAttributeValue}`} value={valAttributeValue}>{valAttributeValue}</MenuItem>
                                )}
                              </Select>
                            </FormControl>
                          </div>
                        }
                        {valAttribute.type === "multiselect" &&
                          <div>
                            <FormControl className={classes.formControl} error={attributeValueError[idxAttribute] || false} required={attributeValueRequired[idxAttribute] || false}>
                              <InputLabel htmlFor="select-multiple-chip">{valAttribute.name}</InputLabel>
                              <Select
                                multiple
                                key={`sel2${idxAttribute}`}
                                value={attributeValue[idxAttribute] || []}
                                onChange={handleAttribute(idxAttribute)}
                                name="attributevalue"
                                input={<Input id={`select-multiple-chip-${idxAttribute}`} />}
                                renderValue={selected => (
                                  <div className={classes.chips}>
                                    {selected.map(value => (
                                      <Chip
                                        key={value}
                                        label={value}
                                        className={classes.chip}
                                      />
                                    ))}
                                  </div>
                                )}
                                MenuProps={MenuProps}
                              >
                                {valAttribute.value.map((valAttributeValue, indexAttributeValue) =>
                                  <MenuItem key={`attr2${indexAttributeValue}`} value={valAttributeValue}>{valAttributeValue}</MenuItem>
                                )}
                              </Select>
                            </FormControl>
                          </div>
                        }
                      </Fragment>
                    )
                  }
                </form>
              </PortletBody>
            </Portlet>
          </div>
          <div className="col-md-12">
            <div style={style.textAlignCenter}>
              <Button onClick={saveForm} color="primary" variant="contained" className={classes.button}>
                Save Data
                </Button>
              <Button onClick={doneForm} variant="contained" className={classes.button}>
                Done
                </Button>
            </div>
          </div>
        </div>
      }

      {!form &&
        <div className="row">
          <div className="col-md-12">
            <Portlet>
              <PortletHeader
                title="List User"
                toolbar={
                  <Button onClick={addUser} color="primary" variant="contained" className={classes.button}>
                    Add User
                  </Button>
                }
              />
              <PortletBody fluid={true}>
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th><FormattedMessage id="USER.FULLNAME" /></th>
                      <th><FormattedMessage id="USER.USERNAME" /></th>
                      <th><FormattedMessage id="USER.EMAIL" /></th>
                      <th><FormattedMessage id="LABEL.ACTION" /></th>
                    </tr>
                  </thead>
                  <tbody>
                    {
                      users.map((value, index) => {
                        return index !== 0 ? <tr key={index}>
                          <td style={style.rowTable}>{index}</td>
                          <td style={style.rowTable}>{value.fullname}</td>
                          <td style={style.rowTable}>{value.username}</td>
                          <td style={style.rowTable}>{value.email}</td>
                          <td>
                            <Button onClick={() => { editUser(value) }} color="primary" variant="contained" className={classes.button}>
                              Edit
                            </Button>
                            <Button onClick={() => { handleClickOpen(value) }} variant="contained" className={classes.button}>
                              Delete
                            </Button>
                          </td>
                        </tr> : null
                      })
                    }
                    {users.length === 0 && (
                      <tr>
                        <td colSpan="5">Data is empty</td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </PortletBody>
            </Portlet>
            <Dialog
              open={open}
              onClose={handleClose}
              aria-labelledby="alert-dialog-title"
              aria-describedby="alert-dialog-description"
            >
              <DialogTitle id="alert-dialog-title">
                {"Delete confirmation?"}
              </DialogTitle>
              <DialogContent>
                <DialogContentText id="alert-dialog-description">
                  Are you sure to delete this data?
                      </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleClose} color="primary">
                  No
                      </Button>
                <Button onClick={deleteUser} color="primary" autoFocus>
                  Yes
                      </Button>
              </DialogActions>
            </Dialog>
          </div>
        </div>
      }
    </>
  );
}

export default injectIntl(
  connect(
    null
  )(User)
);