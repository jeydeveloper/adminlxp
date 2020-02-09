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
    FormLabel
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

function Questioner() {
    const classes = useStyles();

    const initialStateForm = {
        "question": "",
        "question_type": "",
        "options": [{
            "text": "",
            "is_answer": false
        }]
    };
    const [success, setSuccess] = useState(null);
    const [form, setForm] = useState(null);
    const [questions, setQuestioners] = useState([]);
    const [values, setValues] = useState(initialStateForm);
    const [formId, setFormId] = useState(false);
    const [listValue, setListValue] = useState([]);

    useEffect(() => {
        async function fetchData() {
            axios.get(`${REACT_APP_API_URL}/questioners`)
                .then(res => {
                    setQuestioners(res.data)
                })
        }
        fetchData();
    }, []);

    const editQuestioner = (question) => {
        setValues({ ...values, ...question });
        setForm(true);
        setFormId(question._id);
        setListValue(question.options);
    };

    const deleteQuestioner = (question) => {
        axios.delete(`${REACT_APP_API_URL}/questioners/${question._id}`)
            .then(res => {
                setQuestioners(questions.filter(value => value._id !== question._id));
            })
    };

    const handleChange = name => event => {
        setValues({ ...values, [name]: event.target.value });
    };

    const handleMultiValueChange = index => event => {
        let data = listValue;
        data[index].text = event.target.value;
        setValues({ ...values, "options": data });
        listValue[index].text = event.target.value;
    };

    const handleMultiValueChangeOther = index => event => {
        let data = listValue;
        data[index].is_answer = event.target.checked;
        setValues({ ...values, "options": data });
        listValue[index].is_answer = event.target.checked;
    };

    const addQuestioner = () => {
        setValues({ ...values, ...initialStateForm });
        setForm(true);
    };

    const saveForm = () => {
        values.options = listValue;
        if (formId) {
            axios.put(`${REACT_APP_API_URL}/questioners/${formId}`, values)
                .then(res => {
                    setQuestioners(questions.map(value => (value._id === formId ? res.data : value)));
                    setSuccess(true);
                })
        } else {
            axios.post(`${REACT_APP_API_URL}/questioners`, values)
                .then(res => {
                    values._id = res.data._id;
                    setQuestioners([...questions, values]);
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
        setListValue([...listValue, {
            "text": "",
            "is_answer": false
        }]);
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
                        <Portlet>
                            <PortletBody fluid={true}>
                                <form style={style.fullWidth} noValidate autoComplete="off">
                                    <div className="kt-section__content">
                                        <TextField
                                            id="standard-question"
                                            label={<FormattedMessage id="QUESTIONER.QUESTION" />}
                                            value={values.question}
                                            onChange={handleChange("question")}
                                            margin="normal"
                                            fullWidth
                                            required
                                        />
                                    </div>

                                    <div className="kt-section__content">
                                        <FormControl component="fieldset">
                                            <FormLabel component="legend">Choose type of question</FormLabel>
                                            <RadioGroup
                                                aria-label="question_type"
                                                name="question_type"
                                                value={values.question_type}
                                                onChange={handleChange("question_type")}
                                                row
                                            >
                                                <FormControlLabel
                                                    value="single-answer"
                                                    control={<Radio color="primary" />}
                                                    label={<FormattedMessage id="QUESTIONER.SINGLEANSWER" />}
                                                    labelPlacement="end"
                                                />
                                                <FormControlLabel
                                                    value="multiple-answer"
                                                    control={<Radio color="primary" />}
                                                    label={<FormattedMessage id="QUESTIONER.MULTIPLEANSWER" />}
                                                    labelPlacement="end"
                                                />
                                            </RadioGroup>
                                        </FormControl>
                                    </div>

                                    {
                                        listValue.map((value, index) => (
                                            <div className="kt-section__content" key={index}>
                                                <TextField
                                                    id={`standard-value-${index}`}
                                                    label={`Option ${(index + 1)}`}
                                                    value={value.text}
                                                    onChange={handleMultiValueChange(index)}
                                                    margin="normal"
                                                    required
                                                />
                                                <FormControl component="fieldset">
                                                    <FormControlLabel
                                                        control={
                                                            <Checkbox
                                                                checked={value.is_answer}
                                                                onChange={handleMultiValueChangeOther(index)}
                                                                value="1"
                                                                color="primary"
                                                            />
                                                        }
                                                        label="Is Answer?"
                                                    />
                                                </FormControl>
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
                                title="List Questioner"
                                toolbar={
                                    <Button onClick={addQuestioner} color="primary" variant="contained" className={classes.button}>
                                        Add Questioner
                  </Button>
                                }
                            />
                            <PortletBody fluid={true}>
                                <Table striped bordered hover>
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th><FormattedMessage id="QUESTIONER.QUESTION" /></th>
                                            <th><FormattedMessage id="QUESTIONER.QUESTIONTYPE" /></th>
                                            <th><FormattedMessage id="LABEL.ACTION" /></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            questions.map((value, index) => (
                                                <tr key={index}>
                                                    <td style={style.rowTable}>{(index + 1)}</td>
                                                    <td style={style.rowTable}>{value.question}</td>
                                                    <td style={style.rowTable}>{value.question_type}</td>
                                                    <td>
                                                        <Button onClick={() => { editQuestioner(value) }} color="primary" variant="contained" className={classes.button}>
                                                            Edit
                            </Button>
                                                        <Button onClick={() => { deleteQuestioner(value) }} variant="contained" className={classes.button}>
                                                            Delete
                            </Button>
                                                    </td>
                                                </tr>
                                            ))
                                        }
                                        {questions.length === 0 && (
                                            <tr>
                                                <td colSpan="6">Data is empty</td>
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
    )(Questioner)
);