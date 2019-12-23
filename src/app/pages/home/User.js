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
  TextField
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
                  
export default function User() {
    const classes = useStyles();

    const initialStateForm = {
      "fullname": "",
      "username": "",
      "email": "",
      "password": "",
    };
    const [success, setSuccess] = useState(null);
    const [form, setForm] = useState(null);
    const [users, setUsers] = useState([]);
    const [values, setValues] = useState(initialStateForm);
    const [formId, setFormId] = useState(false);

    useEffect(() => {
      async function fetchData() {
        axios.get(`${REACT_APP_API_URL}/users`)
        .then(res => {
          // console.log(res);
          setUsers(res.data)
        })
      }
      fetchData();
    }, []);

    const editUser = (user) => {
      setValues({ ...values, ...user });
      setForm(true);
      setFormId(user._id);
    };

    const deleteUser = (user) => {
      axios.delete(`${REACT_APP_API_URL}/users/${user._id}`)
      .then(res => {
        setUsers(users.filter(value => value._id !== user._id));
      })
    };
    
    const handleChange = name => event => {
      setValues({ ...values, [name]: event.target.value });
    };

    const addUser = () => {
      setValues({ ...values, ...initialStateForm });
      setForm(true);
    };

    const saveForm = () => {
      if(formId) {
        axios.put(`${REACT_APP_API_URL}/users/${formId}`, values)
        .then(res => {
          setUsers(users.map(value => (value._id === formId ? res.data : value)));
          setSuccess(true);
        })
      } else {
        axios.post(`${REACT_APP_API_URL}/users`, values)
        .then(res => {
          values._id = res.data._id;
          setUsers([...users, values]);
          setValues({ ...values, ...initialStateForm });
          setSuccess(true);
        })
      }
    };

    const doneForm = () => {
      setForm(false);
      setSuccess(false);
      setFormId(null);
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
                    id="standard-fullname"
                    label="Fullname"
                    value={values.fullname}
                    onChange={handleChange("fullname")}
                    margin="normal"
                    fullWidth
                    required
                  />
                  <TextField
                    id="standard-username"
                    label="Username"
                    value={values.username}
                    onChange={handleChange("username")}
                    margin="normal"
                    fullWidth
                    required
                  />
                  <TextField
                    id="standard-email"
                    label="Email"
                    value={values.email}
                    onChange={handleChange("email")}
                    margin="normal"
                    fullWidth
                    required
                  />
                  <TextField
                    id="standard-password"
                    label="Password"
                    value={values.password}
                    onChange={handleChange("password")}
                    margin="normal"
                    fullWidth
                    required
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
                      <th>Fullname</th>
                      <th>Username</th>
                      <th>Email</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {
                      users.map((value, index) => (
                        <tr key={index}>
                          <td style={style.rowTable}>{(index + 1)}</td>
                          <td style={style.rowTable}>{value.fullname}</td>
                          <td style={style.rowTable}>{value.username}</td>
                          <td style={style.rowTable}>{value.email}</td>
                          <td>
                            <Button onClick={() => {editUser(value)}} color="primary" variant="contained" className={classes.button}>
                              Edit
                            </Button>
                             <Button onClick={() => {deleteUser(value)}} variant="contained" className={classes.button}>
                              Delete
                            </Button>
                          </td>
                        </tr>
                      ))
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