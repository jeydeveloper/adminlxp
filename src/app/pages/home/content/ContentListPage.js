import React, { useState } from "react";
import { Table } from "react-bootstrap";
import {
  Portlet,
  PortletBody,
  PortletHeader
} from "../../../partials/content/Portlet";
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';
import {
  TextField
} from "@material-ui/core";
import { Alert } from "react-bootstrap";

const useStyles = makeStyles(theme => ({
  button: {
    margin: theme.spacing(1),
  },
}));

const style = {
  rowTable: {"vertical-align":"middle"},
  fullWidth: {width: "100%"},
  textAlignCenter: {"text-align": "center"},
};
                  
export default function ContentListPage() {
    const classes = useStyles();

    const initialStateForm = {
      "no": "",
      "firstname": "",
      "lastname": "",
      "username": ""
    };
    const [success, setSuccess] = useState(null);
    const [form, setForm] = useState(null);
    const [users, setUsers] = useState([]);
    const [values, setValues] = useState(initialStateForm);
    const [formId, setFormId] = useState(false);

    const editUser = (user) => {
      setValues({ ...values, ...user });
      setForm(true);
      setFormId(user.no);
    };

    const deleteUser = (user) => {
      setUsers(users.filter(value => value.no !== user.no));
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
        setUsers(users.map(value => (value.no === formId ? values : value)));
      } else {
        setUsers([...users, values]);
        setValues({ ...values, ...initialStateForm });
      }
      setSuccess(true);
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
                    id="standard-no"
                    label="No"
                    value={values.no}
                    onChange={handleChange("no")}
                    margin="normal"
                    fullWidth
                  />
                  <TextField
                    id="standard-firstname"
                    label="First Name"
                    value={values.firstname}
                    onChange={handleChange("firstname")}
                    margin="normal"
                    fullWidth
                  />
                  <TextField
                    id="standard-lastname"
                    label="Last Name"
                    value={values.lastname}
                    onChange={handleChange("lastname")}
                    margin="normal"
                    fullWidth
                  />
                  <TextField
                    id="standard-username"
                    label="Username"
                    value={values.username}
                    onChange={handleChange("username")}
                    margin="normal"
                    fullWidth
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
                      <th>First Name</th>
                      <th>Last Name</th>
                      <th>Username</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {
                      users.map((value, index) => (
                        <tr key={index}>
                          <td style={style.rowTable}>{value.no}</td>
                          <td style={style.rowTable}>{value.firstname}</td>
                          <td style={style.rowTable}>{value.lastname}</td>
                          <td style={style.rowTable}>{value.username}</td>
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