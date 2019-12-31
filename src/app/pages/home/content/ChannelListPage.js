import React, { useState, useEffect, Fragment } from "react";
import { Table, Image } from "react-bootstrap";
import {
  Portlet,
  PortletBody,
  PortletHeader
} from "../../../partials/content/Portlet";
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
  rowTable: {"verticalAlign":"middle"},
  fullWidth: {width: "100%"},
  textAlignCenter: {"textAlign": "center"},
  marginTopBottom: {
    marginTop: "16px"
  }
};
                  
export default function ChannelListPage() {
    const classes = useStyles();

    const initialStateForm = {
      "title": "",
      "description": "",
      "image": "",
      "content": [],
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
    const [channels, setChannels] = useState([]);
    const [values, setValues] = useState(initialStateForm);
    const [formId, setFormId] = useState(false);
    const [attributes, setAttributes] = useState([]);
    const [attributeValue, setAttributeValue] = useState([]);
    const [images, setImages] = useState(null);
    const [message, setMessage] = useState(null);
    const [contents, setContents] = useState([]);
    const [contentValue, setContentValue] = useState([]);

    useEffect(() => {
      async function fetchData() {
        axios.get(`${REACT_APP_API_URL}/channels`)
        .then(res => {
          // console.log(res);
          setChannels(res.data)
        })
      }
      fetchData();
      async function fetchDataAttribute() {
        axios.get(`${REACT_APP_API_URL}/attributes`)
        .then(res => {
          setAttributes(res.data.filter(value => value.show_for === "channel"));
        })
      }
      fetchDataAttribute();
      async function fetchDataContent() {
        axios.get(`${REACT_APP_API_URL}/contents`)
        .then(res => {
          setContents(res.data);
        })
      }
      fetchDataContent();
    }, []);

    const editContent = (channel) => {
      setValues({ ...values, ...channel });
      setForm(true);
      setFormId(channel._id);
      setAttributeValue(channel.attribute.map(value => value.attribute_value));
      if(channel.content.length > 0) {
        setContentValue(channel.content.map(valChannelContent => {
          let channelContent = contents.filter(valContents => valContents._id === valChannelContent);
          return channelContent[0].title;
        }))
      }
    };

    const deleteContent = (channel) => {
      axios.delete(`${REACT_APP_API_URL}/channels/${channel._id}`)
      .then(res => {
        setChannels(channels.filter(value => value._id !== channel._id));
      })
    };

    const checkMimeType = (event )=> {
      let files = event.target.files;
      let err = '';
      const types = ['image/png', 'image/jpeg', 'image/gif'];
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
      } else if(name === "content") {
        setContentValue(event.target.value);
      } else {
        setValues({ ...values, [name]: event.target.value });
      }
    };

    const handleAttribute = index => event => {
        let newAttributeValue = [...attributeValue];
        newAttributeValue[index] = event.target.value;
        setAttributeValue(newAttributeValue);
    };

    const addChannel = () => {
      setValues(initialStateForm);
      setForm(true);
    };

    const saveForm = () => {
      setSuccess(false);
      setFailed(false);
      values.attribute = attributes.map((valAttribute, idxAttribute) => ({
      "attribute_name":valAttribute.name,
      "attribute_value":(attributeValue[idxAttribute] || "")
      }));
      values.content = contentValue.map(valContentValue => {
        let contentFilter = contents.filter(valContents => valContents.title === valContentValue);
        return contentFilter[0]._id;
      })
      console.log(values);
      if(formId) {
        if(images) {
          const data = new FormData();
          data.append('file', images)
          axios.post(`${REACT_APP_API_URL}/upload`, data)
          .then(res => {
            return axios.put(`${REACT_APP_API_URL}/channels/${formId}`, { ...values, "image":res.data.filename })
          })
          .then(res => {
            setChannels(channels.map(value => (value._id === formId ? res.data : value)));
            setSuccess(true);
          })
          .catch(function (error) {
            console.log(error);
          })
        } else {
          axios.put(`${REACT_APP_API_URL}/channels/${formId}`, values)
          .then(res => {
            setChannels(channels.map(value => (value._id === formId ? res.data : value)));
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
              axios.post(`${REACT_APP_API_URL}/channels`, { ...values, "image":res.data.filename }),
              res.data.filename
            ]);
          })
          .then(res => {
            values._id = res[0].data._id;
            setChannels([...channels, { ...values, "image":res[1] }]);
            setValues({ ...values, ...initialStateForm });
            setSuccess(true);
            clearForm();
          })
          .catch(function (error) {
            console.log(error);
          })
        } else {
          axios.post(`${REACT_APP_API_URL}/channels`, values)
          .then(res => {
            values._id = res.data._id;
            setChannels([...channels, values]);
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
      setFailed(false);
      setFormId(null);
      clearForm();
    };

    const clearForm = () => {
        setAttributeValue([]);
        setImages(null);
        setContentValue([]);
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

                  <input style={{marginTop:"15px"}} type="file" name="file" onChange={handleChange("upload")}/>
                  {
                    attributes.map((valAttribute, idxAttribute) => 
                        <Fragment key={`channelattribute${idxAttribute}`}>
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

                  <FormControl className={classes.formControl}>
                      <InputLabel htmlFor="select-multiple-chip">Select Content</InputLabel>
                      <Select
                        multiple
                        value={contentValue || []}
                        onChange={handleChange("content")}
                        name="contentvalue"
                        input={<Input id={`select-multiple-chip`} />}
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
                        {contents.map((valContents, indexContentValue) =>
                          <MenuItem key={`attr2${indexContentValue}`} value={valContents.title}>{valContents.title}</MenuItem>
                        )}
                      </Select>
                  </FormControl>
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
                title="List Channel"
                toolbar={
                  <Button onClick={addChannel} color="primary" variant="contained" className={classes.button}>
                    Add Channel
                  </Button>
                }
              />
              <PortletBody fluid={true}>
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Title</th>
                      <th>Description</th>
                      <th>Image</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {
                      channels.map((value, index) => {
                        return <tr key={index}>
                          <td style={style.rowTable}>{(index + 1)}</td>
                          <td style={style.rowTable}>{value.title}</td>
                          <td style={style.rowTable}>{value.description}</td>
                          <td style={style.rowTable}><Image style={{"width":"100px"}} src={`${REACT_APP_API_URL}/${value.image}`} thumbnail /></td>
                          <td>
                            <Button onClick={() => {editContent(value)}} color="primary" variant="contained" className={classes.button}>
                              Edit
                            </Button>
                             <Button onClick={() => {deleteContent(value)}} variant="contained" className={classes.button}>
                              Delete
                            </Button>
                          </td>
                        </tr>
                      })
                    }
                    {channels.length === 0 && (
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