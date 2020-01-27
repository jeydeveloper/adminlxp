import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Image } from "react-bootstrap";
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
  Checkbox
} from "@material-ui/core";
import { Alert } from "react-bootstrap";
import axios from "axios";
import { FormattedMessage, injectIntl } from "react-intl";
import { connect } from "react-redux";
import DataTable from 'react-data-table-component';

const { REACT_APP_API_URL, REACT_APP_API_UPLOAD_FOLDER } = process.env;

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

function Setting() {
  const classes = useStyles();

  const initialStateForm = {
    "title": "",
    "image": "",
    "remember_me_timeout": 0,
    "show_error_forget_password": false,
    "show_content_only_on_apps": false
  };
  const [success, setSuccess] = useState(null);
  const [failed, setFailed] = useState(null);
  const [form, setForm] = useState(null);
  const [settings, setSettings] = useState([]);
  const [values, setValues] = useState(initialStateForm);
  const [formId, setFormId] = useState(false);
  const [images, setImages] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    async function fetchData() {
      axios.get(`${REACT_APP_API_URL}/settings`)
        .then(res => {
          // console.log(res);
          setSettings(res.data)
        })
    }
    fetchData();
  }, []);

  const editSetting = useCallback((setting) => {
    setValues({ ...values, ...setting });
    setForm(true);
    setFormId(setting._id);
  }, [values]);

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
    } else if (["show_error_forget_password", "show_content_only_on_apps"].find(value => value === name)) {
      setValues({ ...values, [name]: event.target.checked });
    } else {
      setValues({ ...values, [name]: event.target.value });
    }
  };

  const addSetting = () => {
    setValues({ ...values, ...initialStateForm });
    setForm(true);
  };

  const saveForm = () => {
    if (formId) {
      if (images) {
        const data = new FormData();
        data.append('file', images)
        axios.post(`${REACT_APP_API_URL}/upload`, data)
          .then(res => {
            return axios.put(`${REACT_APP_API_URL}/settings/${formId}`, { ...values, "image": res.data.filename })
          })
          .then(res => {
            setSettings(settings.map(value => (value._id === formId ? res.data : value)));
            setSuccess(true);
          })
          .catch(function (error) {
            console.log(error);
          })
      } else {
        axios.put(`${REACT_APP_API_URL}/settings/${formId}`, values)
          .then(res => {
            setSettings(settings.map(value => (value._id === formId ? res.data : value)));
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
              axios.post(`${REACT_APP_API_URL}/settings`, { ...values, "image": res.data.filename }),
              res.data.filename
            ]);
          })
          .then(res => {
            values._id = res[0].data._id;
            setSettings([...settings, { ...values, "image": res[1] }]);
            setValues({ ...values, ...initialStateForm });
            setSuccess(true);
            clearForm();
          })
          .catch(function (error) {
            console.log(error);
          })
      } else {
        axios.post(`${REACT_APP_API_URL}/settings`, values)
          .then(res => {
            values._id = res.data._id;
            setSettings([...settings, values]);
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
  };

  const columns = useMemo(() => [
    {
      name: <FormattedMessage id="SETTING.NAME" />,
      selector: 'title',
      sortable: true,
    },
    {
      name: <FormattedMessage id="SETTING.IMAGE" />,
      selector: 'image',
      cell: row => row.image ? <Image style={{ "width": "100px" }} src={`${REACT_APP_API_URL}/${REACT_APP_API_UPLOAD_FOLDER}/${row.image}`} thumbnail /> : ''
    },
    {
      name: <FormattedMessage id="LABEL.ACTION" />,
      button: true,
      cell: row => <Button onClick={() => { editSetting(row) }} color="primary" variant="contained" className={classes.button}>Edit</Button>,
    },
  ], [editSetting, classes.button]);

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
                    label={<FormattedMessage id="SETTING.NAME" />}
                    value={values.title}
                    onChange={handleChange("title")}
                    margin="normal"
                    fullWidth
                    required
                  />

                  <input style={{ marginTop: "15px" }} type="file" name="file" onChange={handleChange("upload")} />

                  <TextField
                    id="standard-remember-me-timeout"
                    label={<FormattedMessage id="SETTING.REMEMBERMETIMEOUT" />}
                    value={values.remember_me_timeout}
                    onChange={handleChange("remember_me_timeout")}
                    margin="normal"
                    fullWidth
                    required
                  />

                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={values.show_error_forget_password}
                        onChange={handleChange("show_error_forget_password")}
                        value="1"
                        color="primary"
                      />
                    }
                    label={<FormattedMessage id="SETTING.SHOWERRORFORGETPASSWORD" />}
                  />

                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={values.show_content_only_on_apps}
                        onChange={handleChange("show_content_only_on_apps")}
                        value="1"
                        color="primary"
                      />
                    }
                    label={<FormattedMessage id="SETTING.SHOWCONTENTONLYONAPPS" />}
                  />

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
                title="List Setting"
                toolbar={settings.length === 0 &&
                  <Button onClick={addSetting} color="primary" variant="contained" className={classes.button}>
                    Add Setting
                    </Button>
                }
              />
              <PortletBody fluid={true}>
                <DataTable
                  noHeader
                  columns={columns}
                  data={settings}
                />
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
  )(Setting)
);