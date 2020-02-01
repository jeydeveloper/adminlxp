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
  InputLabel
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
  const [formId, setFormId] = useState(false);
  const [attributes, setAttributes] = useState([]);
  const [attributeValue, setAttributeValue] = useState([]);
  const [message, setMessage] = useState(null);

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
          setAttributes(res.data.filter(value => value.show_for_user));
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

  const deleteUser = (user) => {
    axios.delete(`${REACT_APP_API_URL}/users/${user._id}`)
      .then(res => {
        setUsers(users.filter(value => value._id !== user._id));
      })
  };

  const handleChange = name => event => {
    setFailed(false);
    setMessage(null);
    setValues({ ...values, [name]: event.target.value });
  };

  const handleAttribute = index => event => {
    setFailed(false);
    setMessage(null);
    let newAttributeValue = [...attributeValue];
    newAttributeValue[index] = event.target.value;
    setAttributeValue(newAttributeValue);
  };

  const addUser = () => {
    setValues({ ...values, ...initialStateForm });
    setForm(true);
  };

  const saveForm = () => {
    values.attribute = attributes.map((valAttribute, idxAttribute) => ({
      "attribute_name": valAttribute.name,
      "attribute_value": (attributeValue[idxAttribute] || "")
    }));
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
          setValues({ ...values, ...initialStateForm });
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
    setAttributeValue([]);
  };

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
                  />
                  <TextField
                    id="standard-username"
                    label={<FormattedMessage id="USER.USERNAME" />}
                    value={values.username}
                    onChange={handleChange("username")}
                    margin="normal"
                    fullWidth
                    required
                  />
                  <TextField
                    id="standard-email"
                    label={<FormattedMessage id="USER.EMAIL" />}
                    value={values.email}
                    onChange={handleChange("email")}
                    margin="normal"
                    fullWidth
                    required
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
                          />
                        }
                        {valAttribute.type === "text" &&
                          <TextField
                            value={attributeValue[idxAttribute] || ""}
                            label={valAttribute.name}
                            onChange={handleAttribute(idxAttribute)}
                            margin="normal"
                            fullWidth
                          />
                        }
                        {valAttribute.type === "list" &&
                          <div>
                            <FormControl className={classes.formControl}>
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
                            <FormControl className={classes.formControl}>
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
                            <Button onClick={() => { deleteUser(value) }} variant="contained" className={classes.button}>
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