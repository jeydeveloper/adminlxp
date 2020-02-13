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
    minWidth: 200,
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
  rowTable: {"verticalAlign":"middle"},
  fullWidth: {width: "100%"},
  textAlignCenter: {"textAlign": "center"},
  marginTopBottom: {
    marginTop: "16px", 
    marginBottom: "8px"
  }
};
                  
function Audience() {
    const classes = useStyles();

    const initialStateForm = {
      "name": "",
      "type": "",
      "value": [""]
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
    const [form, setForm] = useState(null);
    const [audiences, setAudiences] = useState([]);
    const [values, setValues] = useState(initialStateForm);
    const [formId, setFormId] = useState(false);
    const [listValue, setListValue] = useState([]);
    const [listIndividual, setListIndividual] = useState([]);
    const [attributes, setAttributes] = useState([]);
    const [fragment1, setFragment1] = useState([]);
    const [fragment2, setFragment2] = useState([]);
    const [fragment2value, setFragment2value] = useState([]);
    const [open, setOpen] = useState(false);

    useEffect(() => {
      async function fetchDataAudience() {
        axios.get(`${REACT_APP_API_URL}/audiences`)
        .then(res => {
          setAudiences(res.data)
        })
      }
      fetchDataAudience();

      async function fetchDataAttribute() {
        axios.get(`${REACT_APP_API_URL}/attributes`)
        .then(res => {
          setAttributes(res.data)
        })
      }
      fetchDataAttribute();

    }, []);

    const editAudience = (audience) => {
      setValues({ ...values, ...audience });
      setForm(true);
      setFormId(audience._id);
      if(audience.type === "attribute") {
        setListValue(audience.value);
        setFragment1(audience.value.map(valList => valList.attribute_name));
        setFragment2(audience.value.map(valList => (attributes.filter(val => val.name === valList.attribute_name)[0])));
        setFragment2value(audience.value.map(valList => valList.attribute_value));
      }
      if(audience.type === "individual") {
        setListIndividual(audience.value.map(valList => valList));
      }
    };

    const deleteAudience = () => {
      let audience = values;
      axios.delete(`${REACT_APP_API_URL}/audiences/${audience._id}`)
      .then(res => {
        setAudiences(audiences.filter(value => value._id !== audience._id));
        setOpen(false);
      })
    };
    
    const handleChange = name => event => {
      setValues({ ...values, [name]: event.target.value });
      if(name === "type") {
        clearForm();
      }
    };

    const handleMultiIndividualChange = index => event => {
      let tmp = [...values.value, event.target.value];
      setValues({ ...values, "value": tmp });
      listIndividual[index] = event.target.value;
    };

    const addAudience = () => {
      setValues({ ...initialStateForm });
      setForm(true);
    };

    const saveForm = () => {
      let newValue = [];
      if(values.type === "attribute") {
        newValue = fragment1.map((valFragment1, idxFragment1) => ({
          "attribute_name":valFragment1,
          "attribute_value":(fragment2value[idxFragment1] || [])
        }))
      }
      if(values.type === "individual") {
        newValue = listIndividual || [];
      }
      values.value = newValue;
      if(formId) {
        axios.put(`${REACT_APP_API_URL}/audiences/${formId}`, values)
        .then(res => {
          setAudiences(audiences.map(value => (value._id === formId ? res.data : value)));
          setSuccess(true);
        })
      } else {
        axios.post(`${REACT_APP_API_URL}/audiences`, values)
        .then(res => {
          values._id = res.data._id;
          setAudiences([...audiences, values]);
          setValues({ ...initialStateForm });
          setSuccess(true);
          clearForm();
        })
      }
    };

    const doneForm = () => {
      setForm(false);
      setSuccess(false);
      setFormId(null);
      clearForm();
    };

    const handleListValue = index => event => {
      let newFragment1 = [...fragment1];
      newFragment1[index] = event.target.value;
      setFragment1(newFragment1);

      let newFragment2 = [...fragment2];
      newFragment2[index] = attributes.filter(val => val.name === event.target.value)[0];
      setFragment2(newFragment2);

      let newFragment2value = [...fragment2value];
      newFragment2value[index] = null;
      setFragment2value(newFragment2value);
    }

    const handleListValueAttribute = index => event => {
      let newFragment2value = [...fragment2value];
      newFragment2value[index] = event.target.value;
      setFragment2value(newFragment2value);
    }

    const addNewValue = () => {
      if(values.type === "attribute") {
        setListValue([...listValue, ""])
        fragment1[listValue.length] = "";
      }
      if(values.type === "individual") {
        setListIndividual([...listIndividual, ""]);
      }
    };

    const clearForm = () => {
      setListIndividual([]);
      setListValue([]);
      setFragment1([]);
      setFragment2([]);
      setFragment2value([]);
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
            <Alert style={{"marginTop":"10px"}} variant="success">
              Save data success!
            </Alert>
            )}
            <Portlet>
              <PortletBody fluid={true}>
                <form style={style.fullWidth} noValidate autoComplete="off">
                  <TextField
                    id="standard-name"
                    label={<FormattedMessage id="AUDIENCE.NAME" />}
                    value={values.name}
                    onChange={handleChange("name")}
                    margin="normal"
                    fullWidth
                    required
                  />
                  <RadioGroup
                  aria-label="type"
                  name="type"
                  value={values.type}
                  onChange={handleChange("type")}
                  row
                  style={{"marginTop": "16px", "marginBottom": "8px"}}
                  >
                  <FormControlLabel
                      value="attribute"
                      control={<Radio color="primary" />}
                      label={<FormattedMessage id="AUDIENCE.TYPEATTRIBUTEUSER" />}
                      labelPlacement="end"
                  />
                  <FormControlLabel
                      value="individual"
                      control={<Radio color="primary" />}
                      label={<FormattedMessage id="AUDIENCE.TYPEINDIVIDUALUSER" />}
                      labelPlacement="end"
                  />
                  </RadioGroup>

                  {
                    listValue.map((valList, indexList) => 
                      <div key={`fragment${indexList}`}>
                        <FormControl className={classes.formControl}>
                        <InputLabel>{`Attribute Name ${(indexList + 1)}`}</InputLabel>
                        <Select
                          key={`sel${indexList}`}
                          value={fragment1[indexList] || ""}
                          onChange={handleListValue(indexList)}
                          displayEmpty
                          name="attribute"
                        >
                          {attributes.map((valAttribute, indexAttribute) =>
                            <MenuItem key={`attr${indexList}${indexAttribute}`} value={valAttribute.name}>{valAttribute.name}</MenuItem>
                          )}
                        </Select>
                        </FormControl>
                        <FormControl className={classes.formControl} disabled>
                          <InputLabel htmlFor="name-disabled">Operator</InputLabel>
                          <Select
                            value={["equal"]}
                            input={<Input name="name" id="name-disabled" />}
                          >
                            <MenuItem value="equal">Equal</MenuItem>
                          </Select>
                        </FormControl>
                        {
                          (fragment2[indexList] || null) !== null && fragment2[indexList].type === "list" && 
                          <FormControl className={classes.formControl}>
                          <InputLabel>{`Attribute Value ${(indexList + 1)}`}</InputLabel>
                          <Select
                            key={`sel2${indexList}`}
                            value={fragment2value[indexList] || ""}
                            onChange={handleListValueAttribute(indexList)}
                            displayEmpty
                            name="attributevalue"
                          >
                            {fragment2[indexList].value.map((valAttributeValue, indexAttributeValue) =>
                              <MenuItem key={`attr2${indexList}${indexAttributeValue}`} value={valAttributeValue}>{valAttributeValue}</MenuItem>
                            )}
                          </Select>
                          </FormControl>
                        }
                        {
                          (fragment2[indexList] || null) !== null && fragment2[indexList].type === "multiselect" && 
                          <FormControl className={classes.formControl}>
                          <InputLabel htmlFor="select-multiple-chip">{`Attribute Value ${(indexList + 1)}`}</InputLabel>
                          <Select
                            multiple
                            key={`sel2${indexList}`}
                            value={fragment2value[indexList] || []}
                            onChange={handleListValueAttribute(indexList)}
                            name="attributevalue"
                            input={<Input id={`select-multiple-chip-${indexList}`} />}
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
                            {fragment2[indexList].value.map((valAttributeValue, indexAttributeValue) =>
                              <MenuItem key={`attr2${indexList}${indexAttributeValue}`} value={valAttributeValue}>{valAttributeValue}</MenuItem>
                            )}
                          </Select>
                          </FormControl>
                        }
                        {
                          (fragment2[indexList] || null) !== null && fragment2[indexList].type === "date" && 
                          <TextField
                            key={`sel2${indexList}`}
                            value={fragment2value[indexList] || ""}
                            type="date"
                            label={`Value Attribute ${(indexList + 1)}`}
                            onChange={handleListValueAttribute(indexList)}
                            margin="normal"
                            style={{width:200}}
                            InputLabelProps={{
                              shrink: true
                            }}
                          />
                        }
                        {
                          (fragment2[indexList] || null) !== null && fragment2[indexList].type === "text" && 
                          <TextField
                            key={`sel2${indexList}`}
                            label={`Value Attribute ${(indexList + 1)}`}
                            value={fragment2value[indexList] || ""}
                            onChange={handleListValueAttribute(indexList)}
                            margin="normal"
                            style={{width:200}}
                          />
                        }
                      </div>
                    )
                  }

                  {
                    listIndividual.map((value, index) => (
                      <TextField
                      key={index}
                      id={`standard-user-${index}`}
                      label={`Individual ${(index + 1)}`}
                      value={value}
                      onChange={handleMultiIndividualChange(index)}
                      margin="normal"
                      fullWidth
                      required
                    />
                  ))
                  }
                </form>
              </PortletBody>
            </Portlet>
            </div>
            <div className="col-md-12">
              <div style={style.textAlignCenter}>
                <Button onClick={() => {addNewValue()}} color="primary" variant="contained" className={classes.button}>
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
                title="List Audience"
                toolbar={
                  <Button onClick={addAudience} color="primary" variant="contained" className={classes.button}>
                    Add Audience
                  </Button>
                }
              />
              <PortletBody fluid={true}>
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th><FormattedMessage id="AUDIENCE.NAME" /></th>
                      <th><FormattedMessage id="AUDIENCE.TYPE" /></th>
                      <th><FormattedMessage id="LABEL.ACTION" /></th>
                    </tr>
                  </thead>
                  <tbody>
                    {
                      audiences.map((value, index) => (
                        <tr key={index}>
                          <td style={style.rowTable}>{(index + 1)}</td>
                          <td style={style.rowTable}>{value.name}</td>
                          <td style={style.rowTable}>{value.type}</td>
                          <td>
                            <Button onClick={() => {editAudience(value)}} color="primary" variant="contained" className={classes.button}>
                              Edit
                            </Button>
                             <Button onClick={() => {handleClickOpen(value)}} variant="contained" className={classes.button}>
                              Delete
                            </Button>
                          </td>
                        </tr>
                      ))
                    }
                    {audiences.length === 0 && (
                      <tr>
                        <td colSpan="4">Data is empty</td>
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
                <Button onClick={deleteAudience} color="primary" autoFocus>
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
  )(Audience)
);