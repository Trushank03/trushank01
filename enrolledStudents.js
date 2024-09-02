import React, { useEffect, useState } from 'react';
import User from './User';
import { fetchEnrolledStudents } from '../../../../../CommonApps/AllAPICalls';

function EnrolledStudents(props) {
  const { selectedCourse, userData } = props;
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [isMounted, setIsMounted] = useState(true);

  useEffect(() => {
    let isMounted = true; 

    if (selectedCourse && selectedCourse.length > 0) {
      const courseId = selectedCourse[0].id;
      fetchEnrolledStudents(courseId)
        .then(data => {
          if (isMounted && data.results && data.results.members) {
            setEnrolledStudents(data.results.members);
          }
        })
        .catch(error => { 
        });
    } 
    return () => {
      isMounted = false;
    };
  }, [selectedCourse]);

  return (
    <div>
      <h3>Enrolled Students</h3>
      {enrolledStudents.length > 0 ? (
        <User enrolledStudents={enrolledStudents} selectedCourse={selectedCourse} userData={userData} rerender={props.rerender} />
      ) : (
        <div>No enrolled students</div>
      )}
    </div>
  );
}

export default EnrolledStudents;
