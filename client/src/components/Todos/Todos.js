import React, { useState, useCallback, useEffect } from "react";
import uuid from "react-uuid";
import { DndProvider } from "react-dnd";
import HTML5Backend from "react-dnd-html5-backend"; // Doesn't work with touch
import update from "immutability-helper";
import TodosColumn from "./TodosColumn";
import TodosItem from "./TodosItem";
import TodoForm from "../TodoForm";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Nav from "react-bootstrap/Nav";
import todoFetch from "../../utils/todoFetch";
import todoPost from "../../utils/todoPost";
import firebase from "firebase/app";
import Button from "react-bootstrap/Button";
import NavDropdown from "react-bootstrap/NavDropdown";
import "firebase/auth";

// The different columns
const channels = ["todo", "inprogress", "completed"];

// What we label the columns.
// Key : Label
// Key is what we store in state
// Label is what's displayed
const labelsMap = {
  todo: "Your Todos",
  inprogress: "In Progress",
  completed: "Completed Tasks"
};

const classes = {
  header: {
    background: "linear-gradient(to bottom right, #0D92FF, #18C6B3)",
    color: "white",
    fontFamily: "'Nunito', sans-serif",
    textAlign: "center",
    paddingTop: "10px",
    paddingBottom: "10px",
    paddingRight: "180px"
  },
  headerBtn: {
    background: "linear-gradient(to bottom, #0D92FF, #46a9dc)",
    color: "white",
    fontFamily: "'Nunito', sans-serif"
  },
  dropdown: {
    backgroundColor: "white",
    borderRadius: "5px",
    width: "75px",
    marginTop: "17px"
  },
  todos: {
    display: "flex",
    backgroundColor: "#F5F6FA",
    margin: "0 20px 0 0",
    padding: "10px",
    width: "90vw",
    fontFamily: "'Nunito', sans-serif"
  },
  noPad: {
    paddingLeft: "0 !important",
    paddingRight: "0 !important"
  },
  activeLink: {
    backgroundColor: "#18C6B3",
    color: "white"
  },
  column: {
    height: "80vh",
    margin: "0 auto",
    backgroundColor: "#F5F6FA"
  },
  todo: {
    backgroundColor: "#F69346",
    textAlign: "center",
    padding: 10,
    fontSize: "1.2em",
    color: "white",
    margin: "10px 5px 0 5px",
    borderRadius: "5px",
    fontWeight: 600
  },
  inprogress: {
    backgroundColor: "#18C6B3",
    textAlign: "center",
    padding: 10,
    fontSize: "1.2em",
    color: "white",
    margin: "10px 5px 0 5px",
    borderRadius: "5px",
    fontWeight: 600
  },
  completed: {
    backgroundColor: "#FFBF13",
    textAlign: "center",
    padding: 10,
    fontSize: "1.2em",
    color: "white",
    margin: "10px 5px 0 5px",
    borderRadius: "5px",
    fontWeight: 600
  },
  item: {
    padding: 10,
    margin: 10,
    fontSize: "0.8em",
    cursor: "pointer",
    backgroundColor: "white",
    borderRadius: "5px"
  }
};

const Todos = props => {
  const [tasks, setTaskStatus] = useState([]);
  const getAllTodos = userID => {
    todoFetch.fetchAll(userID).then(res => {
      console.log(res);
      setTaskStatus(res.data);
    });
  };
  // This code adds new items to the Todos from data from forms
  useEffect(() => {
    console.log(props.userID);
    getAllTodos(props.userID);

    var newState = tasks;
    for (var i = 0; i < props.state.newApplications.length; i++) {
      // Adding status and id to new applications
      props.state.newApplications[i].status = "todo";
      props.state.newApplications[i].userID = props.userID;
      props.state.newApplications[i].jobID = uuid();
      // pushing new applications
      newState.push(props.state.newApplications[i]);
      props.state.newApplications = [];
      todoPost.addTodo(newState[newState.length - 1]);
      getAllTodos(props.userID);
    }
    setTaskStatus(newState);
    changeTaskStatus();
  }, [props]);

  //updating job in db whenever task is changed
  const changeTaskStatus = useCallback(
    (id, status) => {
      // Match the task to the ID
      let task = tasks.find(task => task.ID === id);
      const taskIndex = tasks.indexOf(task);

      // Set the working task
      task = { ...task, status };
      todoPost.updateTodo(task.todoID, task);
      // Update the tasks
      let newTasks = update(tasks, {
        [taskIndex]: { $set: task }
      });

      // Update state
      setTaskStatus(newTasks);
    },
    [tasks]
  );

  return (
    <>
      <Row>
        <Col md={1} style={classes.headerBtn}>
          <NavDropdown title="User" id="nav-dropdown" style={classes.dropdown}>
            <NavDropdown.Item eventKey="4.1">
              <Button
                onClick={() => {
                  const googleAuthProvider = new firebase.auth.GoogleAuthProvider();
                  firebase.auth().signInWithPopup(googleAuthProvider);
                }}
              >
                Sign In with Google
              </Button>
            </NavDropdown.Item>
            <NavDropdown.Item eventKey="4.2">
              <Button
                data-testid="signin-anon"
                onClick={() => {
                  firebase.auth().signInAnonymously();
                }}
              >
                Sign In Anonymously
              </Button>
            </NavDropdown.Item>
            <NavDropdown.Item eventKey="4.3">
              <Button
                onClick={() => {
                  firebase.auth().signOut();
                }}
              >
                Sign Out
              </Button>
            </NavDropdown.Item>
          </NavDropdown>
        </Col>
        <Col md={2} style={classes.headerBtn}>
          <TodoForm state={props.state} setState={props.setState} />
        </Col>
        <Col md={9} style={classes.header}>
          <h1>Applications</h1>
        </Col>
      </Row>
      <Row noGutters={true}>
        <Col md={2}>
          <Nav defaultActiveKey="/" className="flex-column">
            <Nav.Link href="/dashboard" style={classes.activeLink}>
              APPLICATIONS
            </Nav.Link>
            <Nav.Link href="/materials">MATERIALS</Nav.Link>
          </Nav>
        </Col>
        <Col md={10}>
          {/* This handles the click events */}
          {/* I need to figure out how to make it work with touch events */}
          <DndProvider backend={HTML5Backend}>
            <section style={classes.todos}>
              {/* Maps over the different channels and creates a column for each */}
              {channels.map(channel => (
                <Col key={channel} md={3}>
                  <TodosColumn
                    key={channel}
                    status={channel}
                    changeTaskStatus={changeTaskStatus}
                  >
                    <div style={classes.column}>
                      <div style={(classes.columnHead, classes[channel])}>
                        {labelsMap[channel]}
                      </div>
                      <div>
                        {/* Renders the correct tasks onto the column */}
                        {tasks
                          .filter(item => item.status === channel)
                          .map(item => (
                            <TodosItem
                              key={item.jobID}
                              id={item.jobID}
                              todo={item.todo}
                              description={item.description}
                              company={item.company}
                              salary={item.salary}
                              url={item.href}
                              resume={item.resume}
                              coverLetter={item.coverLetter}
                              contactEmail={item.contactEmail}
                            >
                              <div style={classes.item}>
                                {item.todo}
                              </div>
                            </TodosItem>
                          ))}
                      </div>
                    </div>
                  </TodosColumn>
                </Col>
              ))}
            </section>
          </DndProvider>
        </Col>
      </Row>
    </>
  );
};

export default Todos;
