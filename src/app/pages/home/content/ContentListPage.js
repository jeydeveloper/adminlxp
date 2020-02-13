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
  InputLabel,
  FormControlLabel,
  RadioGroup,
  Radio,
  FormLabel,
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
  rowTable: { "verticalAlign": "middle" },
  fullWidth: { width: "100%" },
  textAlignCenter: { "textAlign": "center" },
  marginTopBottom: {
    marginTop: "16px"
  }
};

function ContentListPage() {
  const classes = useStyles();

  const initialStateForm = {
    "title": "",
    "description": "",
    "type": "",
    "modality": "",
    "image": "",
    "source": "",
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
  const [contents, setContents] = useState([]);
  const [values, setValues] = useState(initialStateForm);
  const [formId, setFormId] = useState(false);
  const [attributes, setAttributes] = useState([]);
  const [attributeValue, setAttributeValue] = useState([]);
  const [images, setImages] = useState(null);
  const [message, setMessage] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    async function fetchData() {
      axios.get(`${REACT_APP_API_URL}/contents`)
        .then(res => {
          // console.log(res);
          setContents(res.data)
        })
    }
    fetchData();
    async function fetchDataAttribute() {
      axios.get(`${REACT_APP_API_URL}/attributes`)
        .then(res => {
          setAttributes(res.data.filter(value => value.show_for_content));
        })
    }
    fetchDataAttribute();
  }, []);

  const editContent = (content) => {
    setValues({ ...values, ...content });
    setForm(true);
    setFormId(content._id);
    setAttributeValue(content.attribute.map(value => value.attribute_value));
  };

  const deleteContent = () => {
    let content = values;
    axios.delete(`${REACT_APP_API_URL}/contents/${content._id}`)
      .then(res => {
        setContents(contents.filter(value => value._id !== content._id));
        setOpen(false);
      })
  };

  const checkMimeType = (event) => {
    let files = event.target.files;
    let err = '';
    const types = ['image/png', 'image/jpeg', 'image/gif', 'application/zip'];
    for (let x = 0; x < files.length; x++) {
      if (types.every(type => files[x].type !== type)) {
        err += files[x].type + ' is not a supported format\n';
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
    for (let x = 0; x < files.length; x++) {
      if (files[x].size > size) {
        err += files[x].type + ' is too large, please pick a smaller file (max 2M) \n';
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
    if (name === "upload") {
      const files = event.target.files[0];
      if (checkMimeType(event) && checkFileSize(event)) {
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

  const addContent = () => {
    setValues(initialStateForm);
    setForm(true);
  };

  const saveForm = () => {
    setSuccess(false);
    setFailed(false);
    values.attribute = attributes.map((valAttribute, idxAttribute) => ({
      "attribute_name": valAttribute.name,
      "attribute_value": (attributeValue[idxAttribute] || "")
    }));
    if (formId) {
      if (images) {
        const data = new FormData();
        data.append('file', images)
        axios.post(`${REACT_APP_API_URL}/upload`, data)
          .then(res => {
            return axios.put(`${REACT_APP_API_URL}/contents/${formId}`, { ...values, "image": res.data.filename })
          })
          .then(res => {
            setContents(contents.map(value => (value._id === formId ? res.data : value)));
            setSuccess(true);
          })
          .catch(function (error) {
            console.log(error);
          })
      } else {
        axios.put(`${REACT_APP_API_URL}/contents/${formId}`, values)
          .then(res => {
            setContents(contents.map(value => (value._id === formId ? res.data : value)));
            setSuccess(true);
          })
      }
    } else {
      if (images) {
        const data = new FormData();
        data.append('file', images)
        axios.post(`${REACT_APP_API_URL}/upload`, data)
          .then(res => {
            return Promise.all([
              axios.post(`${REACT_APP_API_URL}/contents`, { ...values, "image": res.data.filename }),
              res.data.filename
            ]);
          })
          .then(res => {
            values._id = res[0].data._id;
            setContents([...contents, { ...values, "image": res[1] }]);
            setValues({ ...initialStateForm });
            setSuccess(true);
            clearForm();
          })
          .catch(function (error) {
            console.log(error);
          })
      } else {
        axios.post(`${REACT_APP_API_URL}/contents`, values)
          .then(res => {
            values._id = res.data._id;
            setContents([...contents, values]);
            setValues({ ...initialStateForm });
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
                    id="standard-title"
                    label={<FormattedMessage id="CONTENT.NAME" />}
                    value={values.title}
                    onChange={handleChange("title")}
                    margin="normal"
                    fullWidth
                    required
                  />
                  <div className="kt-section__content">
                    <TextField
                      id="standard-description"
                      label={<FormattedMessage id="CONTENT.DESCRIPTION" />}
                      value={values.description}
                      onChange={handleChange("description")}
                      margin="normal"
                      fullWidth
                      required
                    />
                  </div>
                  <div className="kt-section__content">
                    <FormControl component="fieldset" margin="normal">
                      <FormLabel component="legend">Choose type of content:</FormLabel>
                      <RadioGroup
                        aria-label="type"
                        name="type"
                        value={values.type}
                        onChange={handleChange("type")}
                        row
                      >
                        <FormControlLabel
                          value="SCORM asset"
                          control={<Radio color="primary" />}
                          label={<FormattedMessage id="CONTENT.TYPESCORMASSET" />}
                          labelPlacement="end"
                        />
                        <FormControlLabel
                          value="Interactive Module"
                          control={<Radio color="primary" />}
                          label={<FormattedMessage id="CONTENT.TYPEINTERACTIVEMODULE" />}
                          labelPlacement="end"
                        />
                        <FormControlLabel
                          value="Video"
                          control={<Radio color="primary" />}
                          label={<FormattedMessage id="CONTENT.TYPEVIDEO" />}
                          labelPlacement="end"
                        />
                        <FormControlLabel
                          value="Game"
                          control={<Radio color="primary" />}
                          label={<FormattedMessage id="CONTENT.TYPEGAME" />}
                          labelPlacement="end"
                        />
                        <FormControlLabel
                          value="eBook"
                          control={<Radio color="primary" />}
                          label={<FormattedMessage id="CONTENT.TYPEEBOOK" />}
                          labelPlacement="end"
                        />
                        <FormControlLabel
                          value="Audio / Podcast"
                          control={<Radio color="primary" />}
                          label={<FormattedMessage id="CONTENT.TYPEAUDIOPODCAST" />}
                          labelPlacement="end"
                        />
                      </RadioGroup>
                    </FormControl>
                  </div>

                  <div className="kt-section__content">
                    <FormControl component="fieldset" margin="normal">
                      <FormLabel component="legend">Choose modality of content:</FormLabel>
                      <RadioGroup
                        aria-label="modality"
                        name="modality"
                        value={values.modality}
                        onChange={handleChange("modality")}
                        row
                      >
                        <FormControlLabel
                          value="Learn"
                          control={<Radio color="primary" />}
                          label={<FormattedMessage id="CONTENT.MODALITYLEARN" />}
                          labelPlacement="end"
                        />
                        <FormControlLabel
                          value="Watch"
                          control={<Radio color="primary" />}
                          label={<FormattedMessage id="CONTENT.MODALITYWATCH" />}
                          labelPlacement="end"
                        />
                        <FormControlLabel
                          value="Play"
                          control={<Radio color="primary" />}
                          label={<FormattedMessage id="CONTENT.MODALITYPLAY" />}
                          labelPlacement="end"
                        />
                        <FormControlLabel
                          value="Read"
                          control={<Radio color="primary" />}
                          label={<FormattedMessage id="CONTENT.MODALITYREAD" />}
                          labelPlacement="end"
                        />
                        <FormControlLabel
                          value="Listen"
                          control={<Radio color="primary" />}
                          label={<FormattedMessage id="CONTENT.MODALITYLISTEN" />}
                          labelPlacement="end"
                        />
                      </RadioGroup>
                    </FormControl>
                  </div>

                  <TextField
                    id="standard-source"
                    label={<FormattedMessage id="CONTENT.SOURCE" />}
                    value={values.source}
                    onChange={handleChange("source")}
                    margin="normal"
                    fullWidth
                    required
                  />

                  <div className="kt-section__content">
                    <FormControl component="fieldset" margin="normal">
                      <FormLabel component="legend">Upload Content:</FormLabel>
                      <input style={{ marginTop: "15px" }} type="file" name="file" onChange={handleChange("upload")} />
                    </FormControl>
                  </div>

                  {
                    attributes.map((valAttribute, idxAttribute) =>
                      <Fragment key={`contentattribute${idxAttribute}`}>
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
                title="List Content"
                toolbar={
                  <Button onClick={addContent} color="primary" variant="contained" className={classes.button}>
                    Add Content
                  </Button>
                }
              />
              <PortletBody fluid={true}>
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th><FormattedMessage id="CONTENT.NAME" /></th>
                      <th><FormattedMessage id="CONTENT.DESCRIPTION" /></th>
                      <th><FormattedMessage id="CONTENT.TYPE" /></th>
                      <th><FormattedMessage id="CONTENT.IMAGE" /></th>
                      <th><FormattedMessage id="LABEL.ACTION" /></th>
                    </tr>
                  </thead>
                  <tbody>
                    {
                      contents.map((value, index) => {
                        return <tr key={index}>
                          <td style={style.rowTable}>{(index + 1)}</td>
                          <td style={style.rowTable}>{value.title}</td>
                          <td style={style.rowTable}>{value.description}</td>
                          <td style={style.rowTable}>{value.type}</td>
                          <td style={style.rowTable}>{value.image && <Image style={{ "width": "100px" }} src={`${REACT_APP_API_URL}/${REACT_APP_API_UPLOAD_FOLDER}/${value.image}`} thumbnail />}</td>
                          <td>
                            <Button onClick={() => { editContent(value) }} color="primary" variant="contained" className={classes.button}>
                              Edit
                            </Button>
                            <Button onClick={() => { handleClickOpen(value) }} variant="contained" className={classes.button}>
                              Delete
                            </Button>
                          </td>
                        </tr>
                      })
                    }
                    {contents.length === 0 && (
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
                <Button onClick={deleteContent} color="primary" autoFocus>
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
  )(ContentListPage)
);