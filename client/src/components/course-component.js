import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import CourseService from "../services/course.service";


function CourseComponent({ currentUser, setCurrentUser }) {
    const navigate = useNavigate();
    let [courseData, setCourseData] = useState(null);

    let handleTakeToLogin = () => {
        navigate('/login');
    }
    useEffect(() => {
        let _id;
        if (currentUser) {
            _id = currentUser.user._id;
            if (currentUser.user.role === "instructor") {
                CourseService.get(_id)
                    .then((data) => {
                        console.log(data.data);
                        setCourseData(data.data);
                    })
                    .catch(e => {
                        console.log(e)
                    })
            } else if (currentUser.user.role === "student") {
                CourseService.getEnrolledCourses(_id)
                    .then((data) => {
                        setCourseData(data.data);
                    })
                    .catch(e => {
                        console.log(e)
                    })
            }
        }
    }, []);

    return (
        <div style={{ padding: "3rem" }}>
            {!currentUser && (
                <div>
                    <p>請先登入再到課程頁瀏覽</p>
                    <button className='btn btn-primary btn-lg' onClick={handleTakeToLogin}>回到登入頁</button>
                </div>
            )}
            {currentUser && currentUser.user.role === 'instructor' && (
                <div>
                    <h1>歡迎來到講師課程頁面</h1>
                </div>
            )}
            {currentUser && currentUser.user.role === 'student' && (
                <div>
                    <h1>歡迎來到學生課程頁面</h1>
                </div>
            )}
            {currentUser && courseData && courseData.length !== 0 && (
                <div style={{ display: "flex", flexWrap: "wrap" }}>
                    {courseData.map((course, index) => {
                        return (
                            <div key={index} className='card' style={{ width: "18rem", margin: "1rem" }}>
                                <div className='card-body'>
                                    <h5 className='card-title'>課程名稱： {course.title}</h5>
                                    <p className="card-text" style={{ margin: "0.5rem 0rem" }}>{course.description}</p>
                                    <p className="card-text" style={{ margin: "0.5rem 0rem" }}>學生人數： {course.students.length}</p>
                                    <p className="card-text" style={{ margin: "0.5rem 0rem" }}>課程價格： {course.price}</p>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

export default CourseComponent;