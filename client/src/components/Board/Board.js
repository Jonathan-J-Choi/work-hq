import React, { useState, useCallback, useEffect } from "react";
import { DndProvider } from "react-dnd";
import HTML5Backend from "react-dnd-html5-backend"; // Doesn't work with touch
import update from "immutability-helper";
import BoardColumn from "./BoardColumn";
import BoardItem from "./BoardItem";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Nav from "react-bootstrap/Nav";

// Dummy job data
const jobList = [
  {
    jobID: 1,
    title: "Street View Driver",
    company: "Google",
    status: "interested"
  },
  { jobID: 2, title: "Hype Man", company: "Theranos", status: "interested" },
  {
    jobID: 3,
    title: "Back End Developer",
    company: "Google",
    status: "interested"
  },
  {
    jobID: 4,
    title: "Front End Developer",
    company: "Google",
    status: "applied"
  },
  { jobID: 5, title: "Warehouse Slave", company: "Amazon", status: "applied" },
  {
    jobID: 6,
    title: "Moustache Groomer",
    company: "Apple",
    status: "responded"
  },
  { jobID: 7, title: "'Genius'", company: "Apple", status: "interviewing" },
  { jobID: 8, title: "Instructor", company: "2U", status: "interviewing" },
  { jobID: 9, title: "Urban Beekeeper", company: "Hive", status: "offer" },
  { jobID: 10, title: "Alcoholic", company: "Freelance", status: "offer" }
];

// The different columns
const channels = [
  "interested",
  "applied",
  "responded",
  "interviewing",
  "offer"
];

// What we label the columns.
// Key : Label
// Key is what we store in state
// Label is what's displayed
const labelsMap = {
  interested: "Interested",
  applied: "Applied",
  responded: "Responded",
  interviewing: "Interviewing",
  offer: "Offer"
};

//set styling for each column as channel.column
// colors
//orange: #F69346
//green: #18C6B3
//yellow: #FFBF13
//blue: #0D92FF
//pink: #FF4A75
// grey: #F5F6FA
const classes = {
  board: {
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
  column: {
    // minWidth: 180,
    // width: "14vw",
    height: "80vh",
    margin: "0 auto",
    backgroundColor: "#F5F6FA"
  },
  // columnHead: {
  //   textAlign: "center",
  //   padding: 10,
  //   fontSize: "1.2em",
  //   color: "white",
  //   margin: "10px 5px 0 5px",
  //   borderRadius: "5px",
  //   fontWeight: 600
  // },
  interested: {
    backgroundColor: "#F69346",
    textAlign: "center",
    padding: 10,
    fontSize: "1.2em",
    color: "white",
    margin: "10px 5px 0 5px",
    borderRadius: "5px",
    fontWeight: 600
  },
  applied: {
    backgroundColor: "#18C6B3",
    textAlign: "center",
    padding: 10,
    fontSize: "1.2em",
    color: "white",
    margin: "10px 5px 0 5px",
    borderRadius: "5px",
    fontWeight: 600
  },
  responded: {
    backgroundColor: "#FFBF13",
    textAlign: "center",
    padding: 10,
    fontSize: "1.2em",
    color: "white",
    margin: "10px 5px 0 5px",
    borderRadius: "5px",
    fontWeight: 600
  },
  interviewing: {
    backgroundColor: "#0D92FF",
    textAlign: "center",
    padding: 10,
    fontSize: "1.2em",
    color: "white",
    margin: "10px 5px 0 5px",
    borderRadius: "5px",
    fontWeight: 600
  },
  offer: {
    backgroundColor: "#FF4A75",
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
const Board = props => {
  console.log(props.state.tasks);
  const [tasks, setTaskStatus] = useState(jobList);

  // This code adds new applications to the board from data from forms
  useEffect(() => {
    setTaskStatus(props.state.tasks);
    // console.log("props in board file", props) // for testing
    var newState = tasks;
    for (var i = 0; i < props.state.newApplications.length; i++) {
      // console.log("looping", props.state.newApplications[i]) // testing the loop

      // Adding status and id to new applications
      props.state.newApplications[i].status = "interested";
      props.state.newApplications[i].jobID = newState.length + 1;
      // pushing new applications
      newState.push(props.state.newApplications[i]);
      props.state.newApplications = [];
    }
    // console.log("success", newState) // for testing
    setTaskStatus(newState);
    changeTaskStatus();
  }, [props]);

  const changeTaskStatus = useCallback(
    (id, status) => {
      // Match the task to the ID
      let task = tasks.find(task => task.jobID === id);
      const taskIndex = tasks.indexOf(task);

      // Set the working task
      task = { ...task, status };

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
    <Container fluid>
      <Row noGutters={true}>
        <Col md={2}>
          <Nav defaultActiveKey="/home" className="flex-column">
            <Nav.Link href="/home">Apps</Nav.Link>
            <Nav.Link eventKey="/materials">Materials</Nav.Link>
            <Nav.Link eventKey="/todos">Todos</Nav.Link>
          </Nav>
        </Col>
        <Col md={10} style={classes.noPad}>
          {/* This handles the click events */}
          {/* I need to figure out how to make it work with touch events */}
          <DndProvider backend={HTML5Backend}>
            <section style={classes.board}>
              {/* Maps over the different channels and creates a column for each */}
              {channels.map(channel => (
                <Col key={channel} md={2}>
                  <BoardColumn
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
                            <BoardItem key={item.jobID} id={item.jobID}>
                              <div style={classes.item}>
                                {item.title} - {item.company}
                              </div>
                            </BoardItem>
                          ))}
                      </div>
                    </div>
                  </BoardColumn>
                </Col>
              ))}
            </section>
          </DndProvider>
        </Col>
      </Row>
    </Container>
  );
};

export default Board;