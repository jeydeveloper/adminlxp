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
  Radio
} from "@material-ui/core";
import { Alert } from "react-bootstrap";
import axios from "axios";

const { REACT_APP_API_URL } = process.env;

const useStyles = makeStyles(theme => ({
  button: {
    margin: theme.spacing(1),
  },
}));

const style = {
  rowTable: {"verticalAlign":"middle"},
  fullWidth: {width: "100%"},
  textAlignCenter: {"textAlign": "center"},
};
                  
export default function Audience() {
    const classes = useStyles();

    const initialStateForm = {
      "name": "",
      "type": "",
      "value": [""]
    };
    const [success, setSuccess] = useState(null);
    const [form, setForm] = useState(null);
    const [audiences, setAudiences] = useState([]);
    const [values, setValues] = useState(initialStateForm);
    const [formId, setFormId] = useState(false);
    const [listValue, setListValue] = useState([""]);

    useEffect(() => {
      async function fetchData() {
        axios.get(`${REACT_APP_API_URL}/audiences`)
        .then(res => {
          // console.log(res);
          setAudiences(res.data)
        })
      }
      fetchData();
    }, []);

    const editAudience = (audience) => {
      setValues({ ...values, ...audience });
      setForm(true);
      setFormId(audience._id);
      setListValue(audience.value);
    };

    const deleteAudience = (audience) => {
      axios.delete(`${REACT_APP_API_URL}/audiences/${audience._id}`)
      .then(res => {
        setAudiences(audiences.filter(value => value._id !== audience._id));
      })
    };
    
    const handleChange = name => event => {
      setValues({ ...values, [name]: event.target.value });
    };

    const addAudience = () => {
      setListValue([""]);
      setValues({ ...values, ...initialStateForm });
      setForm(true);
    };

    const saveForm = () => {
        values.value = listValue;
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
          setListValue([""]);
        })
      }
    };

    const doneForm = () => {
      setForm(false);
      setSuccess(false);
      setFormId(null);
    };

    const addNewValue = () => {
        setListValue([...listValue, ""]);
    };

    return (
      <>
        {form && 
          <div className="row">
            <div className="col-md-12">
            {success && (
            <Alert style={{"margin-top":"10px"}} variant="success">
              Save data success!
            </Alert>
            )}
            <Portlet>
              <PortletBody fluid={true}>
                <form style={style.fullWidth} noValidate autoComplete="off">
                  <TextField
                    id="standard-name"
                    label="name"
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
                  style={{"margin-top": "16px", "margin-bottom": "8px"}}
                  >
                  <FormControlLabel
                      value="attribute"
                      control={<Radio color="primary" />}
                      label="Attribute User"
                      labelPlacement="end"
                  />
                  <FormControlLabel
                      value="individual"
                      control={<Radio color="primary" />}
                      label="Individual User"
                      labelPlacement="end"
                  />
                  </RadioGroup>
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
                      <th>Name</th>
                      <th>Type</th>
                      <th>Action</th>
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
                             <Button onClick={() => {deleteAudience(value)}} variant="contained" className={classes.button}>
                              Delete
                            </Button>
                          </td>
                        </tr>
                      ))
                    }
                    {audiences.length === 0 && (
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