import React, { useState, useEffect, Fragment } from "react";
import { format } from 'date-fns'
import { Table, Image } from "react-bootstrap";
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

const { REACT_APP_API_URL, REACT_APP_API_UPLOAD_FOLDER } = process.env;

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
  rowTable: {"verticalAlign":"middle"},
  fullWidth: {width: "100%"},
  textAlignCenter: {"textAlign": "center"},
  marginTopBottom: {
    marginTop: "16px", 
    marginBottom: "8px"
  }
};
                  
export default function Event() {
    const classes = useStyles();

    const initialStateForm = {
      "title": "",
      "description": "",
      "short_description": "",
      "keynote_speaker": "",
      "start_date": "",
      "end_date": "",
      "event_url": "",
      "image": "",
      "attribute": []
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
    const [events, setEvents] = useState([]);
    const [values, setValues] = useState(initialStateForm);
    const [formId, setFormId] = useState(false);
    const [images, setImages] = useState(null);
    const [message, setMessage] = useState(null);
    const [attributes, setAttributes] = useState([]);
    const [attributeValue, setAttributeValue] = useState([]);

    useEffect(() => {
      async function fetchData() {
        axios.get(`${REACT_APP_API_URL}/events`)
        .then(res => {
          // console.log(res);
          setEvents(res.data)
        })
      }
      fetchData();
      async function fetchDataAttribute() {
        axios.get(`${REACT_APP_API_URL}/attributes`)
        .then(res => {
          setAttributes(res.data.filter(value => value.show_for === "event"));
        })
      }
      fetchDataAttribute();
    }, []);

    const editEvent = (event) => {
        if(event.start_date) {
            event.start_date = format(new Date(event.start_date), 'yyyy-MM-dd');
        }
        if(event.end_date) {
            event.end_date = format(new Date(event.end_date), 'yyyy-MM-dd');
        }
      setValues({ ...values, ...event });
      setForm(true);
      setFormId(event._id);
      setAttributeValue(event.attribute.map(value => value.attribute_value));
    };

    const deleteEvent = (event) => {
      axios.delete(`${REACT_APP_API_URL}/events/${event._id}`)
      .then(res => {
        setEvents(events.filter(value => value._id !== event._id));
      })
    };

    const checkMimeType = (event )=> {
        let files = event.target.files;
        let err = '';
        const types = ['image/png', 'image/jpeg', 'image/gif', 'application/zip'];
        for(let x = 0; x<files.length; x++) {
          if (types.every(type => files[x].type !== type)) {
            err += files[x].type+' is not a supported format\n';
          }
        };
      
        if (err !== '') {
          event.target.value = null;
          setFailed(true);
          setMessage(err);
          return false; 
        }
       return true;
      }
  
      const checkFileSize = (event) => {
        let files = event.target.files;
        let size = 2097152; //2M
        let err = ""; 
        for(let x = 0; x<files.length; x++) {
            if (files[x].size > size) {
            err += files[x].type+' is too large, please pick a smaller file (max 2M) \n';
          }
        };
        if (err !== '') {
            event.target.value = null;
            setFailed(true);
            setMessage(err);
            return false;
        }
        return true;
      }
    
      const handleChange = name => event => {
        setFailed(false);
        setMessage(null);
        if(name === "upload") {
          const files = event.target.files[0];
          if(checkMimeType(event) && checkFileSize(event)) {
            setImages(files);
          }
        } else {
          setValues({ ...values, [name]: event.target.value });
        }
      };

      const handleAttribute = index => event => {
        let newAttributeValue = [...attributeValue];
        newAttributeValue[index] = event.target.value;
        setAttributeValue(newAttributeValue);
    };

    const addEvent = () => {
      setValues({ ...values, ...initialStateForm });
      setForm(true);
    };

    const saveForm = () => {
        values.attribute = attributes.map((valAttribute, idxAttribute) => ({
            "attribute_name":valAttribute.name,
            "attribute_value":(attributeValue[idxAttribute] || "")
            }));
        if(formId) {
            if(images) {
              const data = new FormData();
              data.append('file', images)
              axios.post(`${REACT_APP_API_URL}/upload`, data)
              .then(res => {
                return axios.put(`${REACT_APP_API_URL}/events/${formId}`, { ...values, "image":res.data.filename })
              })
              .then(res => {
                setEvents(events.map(value => (value._id === formId ? res.data : value)));
                setSuccess(true);
              })
              .catch(function (error) {
                console.log(error);
              })
            } else {
              axios.put(`${REACT_APP_API_URL}/events/${formId}`, values)
              .then(res => {
                setEvents(events.map(value => (value._id === formId ? res.data : value)));
                setSuccess(true);
              })
            }
          } else {
            if(images) {
              const data = new FormData();
              data.append('file', images)
              axios.post(`${REACT_APP_API_URL}/upload`, data)
              .then(res => {
                return Promise.all([
                  axios.post(`${REACT_APP_API_URL}/events`, { ...values, "image":res.data.filename }),
                  res.data.filename
                ]);
              })
              .then(res => {
                values._id = res[0].data._id;
                setEvents([...events, { ...values, "image":res[1] }]);
                setValues({ ...values, ...initialStateForm });
                setSuccess(true);
                clearForm();
              })
              .catch(function (error) {
                console.log(error);
              })
            } else {
              axios.post(`${REACT_APP_API_URL}/events`, values)
              .then(res => {
                values._id = res.data._id;
                setEvents([...events, values]);
                setValues({ ...values, ...initialStateForm });
                setSuccess(true);
                clearForm();
              })
              .catch(function (error) {
                setFailed(true);
              })
            }
          }
    };

    const doneForm = () => {
      setForm(false);
      setSuccess(false);
      setFormId(null);
      clearForm();
    };

    const clearForm = () => {
        setImages(null);
        setAttributeValue([]);
    };

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
            {failed && (
            <Alert style={{"marginTop":"10px"}} variant="danger">
              {message}
            </Alert>
            )}
            <Portlet>
              <PortletBody fluid={true}>
                <form style={style.fullWidth} noValidate autoComplete="off">
                  <TextField
                    id="standard-title"
                    label="Title"
                    value={values.title}
                    onChange={handleChange("title")}
                    margin="normal"
                    fullWidth
                    required
                  />

                  <TextField
                    id="standard-description"
                    label="Description"
                    value={values.description}
                    onChange={handleChange("description")}
                    margin="normal"
                    fullWidth
                    required
                  />

                  <TextField
                    id="standard-short-description"
                    label="Short Description"
                    value={values.short_description}
                    onChange={handleChange("short_description")}
                    margin="normal"
                    fullWidth
                    required
                  />

                  <TextField
                    id="standard-event-url"
                    label="Event URL"
                    value={values.event_url}
                    onChange={handleChange("event_url")}
                    margin="normal"
                    fullWidth
                    required
                  />

                    <TextField
                        id="standard-start-date"
                        value={values.start_date}
                        type="date"
                        label="Start Date"
                        onChange={handleChange("start_date")}
                        margin="normal"
                        fullWidth
                        InputLabelProps={{
                            shrink: true
                        }}
                    />

                    <TextField
                        id="standard-end-date"
                        value={values.end_date}
                        type="date"
                        label="End Date"
                        onChange={handleChange("end_date")}
                        margin="normal"
                        fullWidth
                        InputLabelProps={{
                            shrink: true
                        }}
                    />

                    <TextField
                        id="standard-keynote-speaker"
                        label="Keynote Speaker"
                        value={values.keynote_speaker}
                        onChange={handleChange("keynote_speaker")}
                        margin="normal"
                        fullWidth
                        required
                    />

                    <input style={{marginTop:"15px"}} type="file" name="file" onChange={handleChange("upload")}/>

                    {
                    attributes.map((valAttribute, idxAttribute) => 
                        <Fragment key={`eventattribute${idxAttribute}`}>
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
                    title="List Event"
                    toolbar={ 
                    <Button onClick={addEvent} color="primary" variant="contained" className={classes.button}>
                        Add Event
                    </Button>
                    }
                />
              <PortletBody fluid={true}>
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Name</th>
                      <th>Image</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {
                      events.map((value, index) => (
                        <tr key={index}>
                          <td style={style.rowTable}>{(index + 1)}</td> 
                          <td style={style.rowTable}>{value.title}</td>
                      <td style={style.rowTable}>{value.image && <Image style={{"width":"100px"}} src={`${REACT_APP_API_URL}/${REACT_APP_API_UPLOAD_FOLDER}/${value.image}`} thumbnail />}</td>
                          <td>
                            <Button onClick={() => {editEvent(value)}} color="primary" variant="contained" className={classes.button}>
                              Edit
                            </Button>
                            <Button onClick={() => {deleteEvent(value)}} variant="contained" className={classes.button}>
                              Delete
                            </Button>
                          </td>
                        </tr>
                      ))
                    }
                    {events.length === 0 && (
                      <tr>
                        <td colSpan="4">Data is empty</td>
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