import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import courseService from "../services/course.service";

const EnrollComponent = ({ currentUser, setCurrentUser }) => {
  let [searchInput, setSearchInput] = useState('');
  let [searchResult, setSearchResult] = useState([]);
  const navigate = useNavigate();

  const handleTakeToLogin = () => {
    navigate('/login');
  };

  const handleChangeInput = (e) => {
    setSearchInput(e.target.value);
  }

  const handleSearch = () => {
    courseService.searchCourse(searchInput)
      .then((data) => {
        console.log(data);
        if(data.data.length === 0) {
          setSearchResult("搜尋不到相關課程");
        } else {
          setSearchResult(data.data);
        }
      })
      .catch(e => {
        console.log(e)
      });
  }
  const handleEnroll = (e) => {
    e.preventDefault();
    courseService.enroll(e.target.id)
      .then(() => {
        window.alert('課程註冊成功，重新導向到課程頁面');
        navigate('/course');
      })
      .catch(e => {
        console.log(e)
      });;
  }

  return (
    <div style={{ padding: "3rem" }}>
      {!currentUser && (
        <div>
          <p>請先登入再註冊課程</p>
          <button className='btn btn-primary btn-lg' onClick={handleTakeToLogin}>回到登入頁</button>
        </div>
      )}
      {currentUser && currentUser.user.role === 'instructor' && (
        <div>
          <h1>只有學生才能註冊課程</h1>
        </div>
      )}
      {currentUser && currentUser.user.role === 'student' && (
        <div className="search input-group px-3">
          <input
            onChange={handleChangeInput}
            type="text"
            className="form-control"
          />
          <button onClick={handleSearch} className='btn btn-primary'>搜尋課程</button>
        </div>
      )}
      {currentUser && searchResult && searchResult !== "搜尋不到相關課程" && searchResult.length !== 0 && (
        <div>
          <h5 className='pt-5'>課程搜尋結果：</h5>
          {searchResult.map((course, index) => {
            return (
              <div key={course._id} className='card' style={{ width: "18rem", margin: "1rem" }}>
                <div className='card-body'>
                  <h5 className='card-title'>課程名稱： {course.title}</h5>
                  <p className="card-text" style={{ margin: "0.5rem 0rem" }}>{course.description}</p>
                  <p className="card-text" style={{ margin: "0.5rem 0rem" }}>學生人數： {course.students.length}</p>
                  <p className="card-text" style={{ margin: "0.5rem 0rem" }}>課程價格： {course.price}</p>
                  <p className="card-text" style={{ margin: "0.5rem 0rem" }}>講師： {course.instructor.username}</p>
                  <a onClick={handleEnroll} href='javascript:void(0)' id={course._id} className='card-text btn btn-primary'>註冊課程</a>
                </div>
              </div>
            )
          })}
        </div>)}
      {currentUser && searchResult === '搜尋不到相關課程' && (
        <div>
          <h5 className='pt-5'>{searchResult}</h5>
        </div>)}
    </div>
  )
}

export default EnrollComponent