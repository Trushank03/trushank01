import React, { useEffect, useRef, useState } from 'react';
import classes from "./Pending.module.css";
import { HiDotsVertical } from "react-icons/hi";
import { GrScorecard } from "react-icons/gr";
import { MdDoubleArrow } from "react-icons/md";
import { deleteAssignment } from '../../CommonApps/AllAPICalls';
import { useHistory } from 'react-router-dom';
import PublishTime from "./publishTime.jpeg";
import DueDate from "./DueTime.jpeg";
import Credit from "./Credit.jpeg";
import subm from "./Subm.jpeg";
import EditAssignmentForm from './EditAssignmentForm';
import DetailsViewAssignment from './DetailsViewAssignment';
import OutsideAlerter from '../../CommonApps/OutsideAlerter';
import FadeLoader from "react-spinners/BeatLoader";


const AssignmentBoxPending = (props) => {
  const [rerender, setRerender] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false); // New state for deletion process
  const history = useHistory();
  const menuRef = useRef(null);
  const [isDetailsView, setIsDetailsView] = useState(false);
  const override = {
    display: "block",
    margin: "0 auto",
    borderColor: "red",
    fontSize: "10px",
  };

  const handleClickOutside = (event) => {
    if (menuRef.current && !menuRef.current.contains(event.target)) {
      setMenuVisible(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  let color = "white";

  const rerenderHandler = () => {
    setRerender(!rerender);
  };

  const Page2handler = () => {
    setIsDetailsView(true);
    props.newrender();
  };

  const TeacherViewHandler = () => {
    history.push({
      pathname: "/course/assignments/allstudents",
      state: { assignment: props.oneAssignment }
    });
  };

  const handleDeleteConfirm = () => {
    setShowDeleteConfirm(true);
    setMenuVisible(false);
  };

  const handleDelete = async () => {
    setIsDeleting(true);  // Set deleting state to true
    try {
      await deleteAssignment(props.oneAssignment.id, props);
      //console.log("Assignment deleted successfully");
      setShowDeleteConfirm(false);
      props.rerender();
    } catch (error) {
      //console.error("Error deleting assignment:", error);
    } finally {
      setIsDeleting(false); // Reset deleting state after the deletion process
    }
  };

  const handleEditClick = () => {
    setIsEditing(true);
    setMenuVisible(false);
  };

  const handleCloseEditForm = () => {
    setIsEditing(false);
    props.rerender();
  };

  if (!props.selectedCourse || props.selectedCourse.length === 0) {
    return null;
  }

  const uploaderExists = props.oneAssignment.questionFiles &&
    props.oneAssignment.questionFiles[0] &&
    props.oneAssignment.questionFiles[0].uploader;

  const course = props.selectedCourse[0];
  const isCreator = course.creater.id === props.userData.id;
  const isAdmin = Array.isArray(course.admins) && course.admins.some(admin => admin.id === props.userData.id);
  const isTeacher = Array.isArray(course.teachers) && course.teachers.some(teacher => teacher.id === props.userData.id);

  const cannotAddStudents = isCreator || isAdmin || isTeacher;

  const closeDropDownHandler = () => {
    setMenuVisible(false);
  }

  function getStatusColor(status) {
    switch (status) {
      case 'open':
        return 'green';
      case 'closed':
        return 'red';
      case 'reviewed':
        return 'darkBlue';
      default:
        return 'black';
    }
  }
  const enrolledStudentsCount = props.selectedCourse[0].enrolled_students.length;

  return (
    <div className={classes.mainBox}>
      {isDetailsView ? (
        <DetailsViewAssignment
          assignment={props.oneAssignment}
          isPeople={cannotAddStudents}
          rerender={props.rerender}
          userData={props.userData}
          onPress={props.onPress}
          onClose={() => setIsDetailsView(false)}
          selectedCourse={props.selectedCourse}
          newrender={props.newrender}
        />
      ) : (
        <>
          <div className={classes.numberBox}>
            <p className={classes.assignmentNumber}>Assignment Number : {props.oneAssignment.id}</p>
            <div className={classes.delete}>
              <p className={classes.status} style={{ color: getStatusColor(props.oneAssignment.status) }}>
                {props.oneAssignment.status}
              </p>
              <div className={classes.optionsContainer}>
                {cannotAddStudents && (
                  <span className={classes.threeDots} onClick={() => setMenuVisible(!menuVisible)}>
                    <HiDotsVertical />
                  </span>
                )}
                 {menuVisible && (
                  <div className={classes.dropdownMenu} ref={menuRef}>
                    <div className={classes.dropdownItem} onClick={handleEditClick}>Edit</div>
                    <div className={classes.dropdownItem} onClick={handleDeleteConfirm}>Delete</div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className={classes.headingBox}>
            <h1 className={classes.heading}>{props.oneAssignment.title}</h1>
          </div>
          {uploaderExists && (
            <div className={classes.assignedBy}>
              Assigned By: {props.oneAssignment.questionFiles[0].uploader.firstname} {props.oneAssignment.questionFiles[0].uploader.lastname}
            </div>
          )}
          <div className={classes.dates}>
            <div className={classes.publishedDate}>
              <img src={PublishTime} alt="Fast Time" className={classes.icon} />
              <div className={classes.dateText}>Published Date</div>
              <div className={classes.dateNumber}>: &nbsp;{props.oneAssignment.publishDate}</div>
            </div>
          </div>
          <div className={classes.dueDate}>
            <img src={DueDate} alt="Deadline" className={classes.icon} />
            <span className={classes.dateText}>Due Date</span>
            <div className={classes.dateNumber1}>: &nbsp;{props.oneAssignment.dueDate}</div>
          </div>
          <div className={classes.assignmentBox}>
            <div className={classes.credit}>
              <img src={Credit} alt="Credit Score" className={classes.icon} />
              <span className={classes.total}>Total Credit :</span>
              <span className={classes.Number}>  &nbsp;{props.oneAssignment.credit}</span>
            </div>

            <div className={classes.creditTwo}>
              <img src={Credit} alt="Credit Score" className={classes.icon} />
              <span className={classes.total1}>Total No of Submission :</span>
              <span className={classes.Number}>  0/{enrolledStudentsCount}</span>
            </div>


            <div className={classes.detailsBox}>
              {props.oneAssignment.status === "closed" ? null : <button onClick={Page2handler} className={classes.viewDetailsBtn}>
                View Details
              </button>}

            </div>
          </div>
          {isEditing && (
            <EditAssignmentForm
              assignment={props.oneAssignment}
              userData={props.userData}
              onClose={handleCloseEditForm}
              selectedCourse={props.selectedCourse}
              rerender={props.rerender}
            />
          )}
          {showDeleteConfirm && (
            <div className={classes.overLay}>
              <div className={classes.confirmDialog}>
                <p className={classes.p}>
                  {isDeleting ? <div><p>"Are you sure you want to delete this assignment?"</p>  <div className={classes.div}>
                    <button className={classes.deleteNo} onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
                    <button className={classes.deleteYes} onClick={handleDelete}><FadeLoader color={color} loading={true} css={override} size={10} />Deleting...</button>
                  </div> </div> : "Are you sure you want to delete this assignment?"}
                </p>
                {!isDeleting && (
                  <div className={classes.div}>
                    <button className={classes.deleteNo} onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
                    <button className={classes.deleteYes} onClick={handleDelete}>Yes, Delete</button>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AssignmentBoxPending;
