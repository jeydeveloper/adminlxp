import React, { useState, useEffect } from "react";
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
  FormControlLabel,
  RadioGroup,
  Radio,
  Checkbox,
  FormControl,
  FormLabel,
  FormGroup,
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

function Attribute() {
  const classes = useStyles();

  const initialStateForm = {
    "name": "",
    "show_for_user": false,
    "show_for_content": false,
    "show_for_channel": false,
    "show_for_event": false,
    "type": "",
    "mandatory": false,
    "value": []
  };
  const [success, setSuccess] = useState(null);
  const [form, setForm] = useState(null);
  const [attributes, setAttributes] = useState([]);
  const [values, setValues] = useState(initialStateForm);
  const [formId, setFormId] = useState(false);
  const [listValue, setListValue] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    async function fetchData() {
      axios.get(`${REACT_APP_API_URL}/attributes`)
        .then(res => {
          // console.log(res);
          setAttributes(res.data)
        })
    }
    fetchData();
  }, []);

  const editAttribute = (attribute) => {
    setValues({ ...values, ...attribute });
    setForm(true);
    setFormId(attribute._id);
    setListValue(attribute.value);
  };

  const deleteAttribute = () => {
    let attribute = values;
    axios.delete(`${REACT_APP_API_URL}/attributes/${attribute._id}`)
      .then(res => {
        setAttributes(attributes.filter(value => value._id !== attribute._id));
        setOpen(false);
      })
  };

  const handleChange = name => event => {
    if (["mandatory", "show_for_user", "show_for_content", "show_for_channel", "show_for_event"].find(value => value === name)) {
      setValues({ ...values, [name]: event.target.checked });
    } else {
      setValues({ ...values, [name]: event.target.value });
    }

    if (event.target.value === "date" || event.target.value === "text") {
      setListValue([]);
    }
    if (event.target.value === "list" || event.target.value === "multiselect") {
      setListValue([""]);
    }
  };

  const handleMultiValueChange = index => event => {
    let tmp = [...values.value, event.target.value];
    setValues({ ...values, "value": tmp });
    listValue[index] = event.target.value;
  };

  const addAttribute = () => {
    setValues({ ...initialStateForm });
    setForm(true);
  };

  const saveForm = () => {
    values.value = listValue;
    if (formId) {
      axios.put(`${REACT_APP_API_URL}/attributes/${formId}`, values)
        .then(res => {
          setAttributes(attributes.map(value => (value._id === formId ? res.data : value)));
          setSuccess(true);
        })
    } else {
      axios.post(`${REACT_APP_API_URL}/attributes`, values)
        .then(res => {
          values._id = res.data._id;
          setAttributes([...attributes, values]);
          setValues({ ...initialStateForm });
          setSuccess(true);
          setListValue([]);
        })
    }
  };

  const doneForm = () => {
    setForm(false);
    setSuccess(false);
    setFormId(null);
    setListValue([]);
  };

  const addNewValue = () => {
    setListValue([...listValue, ""]);
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
            <Portlet>
              <PortletBody fluid={true}>
                <form style={style.fullWidth} noValidate autoComplete="off">
                  <div className="kt-section__content">
                    <TextField
                      id="standard-name"
                      label={<FormattedMessage id="ATTRIBUTE.NAME" />}
                      value={values.name}
                      onChange={handleChange("name")}
                      margin="normal"
                      fullWidth
                      required
                    />
                  </div>

                  <div className="kt-section__content">
                    <FormControl component="fieldset">
                      <FormLabel component="legend">Show For?</FormLabel>
                      <FormGroup
                        aria-label="show-for"
                      >
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={values.show_for_user}
                              onChange={handleChange("show_for_user")}
                              value="1"
                              color="primary"
                            />
                          }
                          label="Show For User"
                        />
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={values.show_for_content}
                              onChange={handleChange("show_for_content")}
                              value="1"
                              color="primary"
                            />
                          }
                          label="Show For Content"
                        />
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={values.show_for_channel}
                              onChange={handleChange("show_for_channel")}
                              value="1"
                              color="primary"
                            />
                          }
                          label="Show For Channel"
                        />
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={values.show_for_event}
                              onChange={handleChange("show_for_event")}
                              value="1"
                              color="primary"
                            />
                          }
                          label="Show For Event"
                        />
                      </FormGroup>
                    </FormControl>
                  </div>

                  <div className="kt-section__content">
                    <FormControl component="fieldset">
                      <FormLabel component="legend">Is Mandatory?</FormLabel>
                      <FormGroup
                        aria-label="show-for"
                        row
                      >
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={values.mandatory}
                              onChange={handleChange("mandatory")}
                              value="1"
                              color="primary"
                            />
                          }
                          label="Mandatory"
                        />
                      </FormGroup>
                    </FormControl>
                  </div>

                  <div className="kt-section__content">
                    <FormControl component="fieldset">
                      <FormLabel component="legend">Choose type of attribute</FormLabel>
                      <RadioGroup
                        aria-label="type"
                        name="type"
                        value={values.type}
                        onChange={handleChange("type")}
                        row
                      >
                        <FormControlLabel
                          value="list"
                          control={<Radio color="primary" />}
                          label={<FormattedMessage id="ATTRIBUTE.TYPELIST" />}
                          labelPlacement="end"
                        />
                        <FormControlLabel
                          value="multiselect"
                          control={<Radio color="primary" />}
                          label={<FormattedMessage id="ATTRIBUTE.TYPEMULTISELECT" />}
                          labelPlacement="end"
                        />
                        <FormControlLabel
                          value="date"
                          control={<Radio color="primary" />}
                          label={<FormattedMessage id="ATTRIBUTE.TYPEDATE" />}
                          labelPlacement="end"
                        />
                        <FormControlLabel
                          value="text"
                          control={<Radio color="primary" />}
                          label={<FormattedMessage id="ATTRIBUTE.TYPETEXT" />}
                          labelPlacement="end"
                        />
                      </RadioGroup>
                    </FormControl>
                  </div>

                  {
                    listValue.map((value, index) => (
                      <div className="kt-section__content">
                        <TextField
                          key={index}
                          id={`standard-value-${index}`}
                          label={`Value ${(index + 1)}`}
                          value={value}
                          onChange={handleMultiValueChange(index)}
                          margin="normal"
                          fullWidth
                          required
                        />
                      </div>
                    ))
                  }
                </form>
              </PortletBody>
            </Portlet>
          </div>
          <div className="col-md-12">
            <div style={style.textAlignCenter}>
              <Button onClick={() => { addNewValue() }} color="primary" variant="contained" className={classes.button}>
                Add New Value
                </Button>
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
                title="List Attribute"
                toolbar={
                  <Button onClick={addAttribute} color="primary" variant="contained" className={classes.button}>
                    Add Attribute
                  </Button>
                }
              />
              <PortletBody fluid={true}>
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th><FormattedMessage id="ATTRIBUTE.NAME" /></th>
                      <th><FormattedMessage id="ATTRIBUTE.TYPE" /></th>
                      <th><FormattedMessage id="ATTRIBUTE.VALUE" /></th>
                      <th><FormattedMessage id="LABEL.ACTION" /></th>
                    </tr>
                  </thead>
                  <tbody>
                    {
                      attributes.map((value, index) => (
                        <tr key={index}>
                          <td style={style.rowTable}>{(index + 1)}</td>
                          <td style={style.rowTable}>{value.name}</td>
                          <td style={style.rowTable}>{value.type}</td>
                          <td style={style.rowTable}>{value.value.join(", ")}</td>
                          <td>
                            <Button onClick={() => { editAttribute(value) }} color="primary" variant="contained" className={classes.button}>
                              Edit
                            </Button>
                            <Button onClick={() => { handleClickOpen(value) }} variant="contained" className={classes.button}>
                              Delete
                            </Button>
                          </td>
                        </tr>
                      ))
                    }
                    {attributes.length === 0 && (
                      <tr>
                        <td colSpan="6">Data is empty</td>
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
                <Button onClick={deleteAttribute} color="primary" autoFocus>
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
  )(Attribute)
);