import React, { useState, useEffect } from 'react';
import classes from './CourseSyllabus.module.css';
import {
   getsyllabusfromId,
   putsectiondata, editsectiondata, createnewsection, deletechapterdata,
   deletesectiondata
} from './../../CommonApps/AllAPICalls';
import AddChapterButton from './AddChapterButton';
import SectionIter from './SectionIter';
import AddSectionButton from './AddSectionButton';
import { BsTrash } from 'react-icons/bs';
import { BiEdit } from 'react-icons/bi';



import ChapterCreationForm from './ChapterCreationForm';
import ChapterEditForm from './ChapterEditForm';



import Switch from "react-switch";




const CourseSyllabus = (props) => {

   //console.log("Course syllabus rendering");
   const [syllabusData, getSyllabusData] = useState({ "chapters": [] });
   const [rerender, setRerender] = useState(false);

   const [showChapterEditForm, setShowChapterEditForm] = useState(false);


   //console.log("selectedCourse: ", props.selectedCourse);


   let syllabusId = props.selectedCourse[0].syllabus;

   useEffect(() => {

      getsyllabusfromId({ syllabusId, getSyllabusData });

      return () => {
         getSyllabusData(syllabusData => ({ "chapters": [] }));
      }

   }, [syllabusId, rerender]);


   const [showSectionEdit, setShowSectionEdit] = useState({ chapterId: 0, sectionId: 0 });

   let sectionEditStyle = {
      borderStyle: 'none',
      borderWidth: '1px',
      borderColor: 'lightgrey',
      margin: '10px'
   }



   const editSectionHandler = ({ chapterId, sectionId }) => {

      setShowSectionEdit({ chapterId: chapterId, sectionId: sectionId });

   }


   const addSectionHandler = ({ chapterId }) => {

      let sectionPostData = { "name": "New Section", "chapterid": chapterId };
      createnewsection({ sectionPostData, setRerender });

   }


   const deleteSectionHandler = ({ sectionId }) => {
      let sectionid = sectionId;
      deletesectiondata({ sectionid }, props);

   }



   const [onChangeSectionData, setOnChangeSectionData] = useState([]);

   const handleChange = (event) => {
      let alltext = event.target.value;
      //setOnChangeSectionData(onChangeSectionData=>topicArray);
      //console.log("alltext: ", alltext);
      //console.log("all_text: ", alltext);
      //let topicnamesArray = alltext.split(".");
      //let topicArray = []

      //  for (let i = 0; i < topicnamesArray.length; i++) {
      //     let topicObj={}
      //     if(topicnamesArray[i] !=="" ){
      //     topicObj['name']=topicnamesArray[i]+'.';
      //     topicArray.push(topicObj)   
      //     }
      //   }
      setOnChangeSectionData(onChangeSectionData => alltext);
   }

   const SaveSectionHandler = ({ chapterId, sectionId }) => {
      //console.log("chapterId, sectionId: ",chapterId,"----" ,sectionId);     
      let sectionid = sectionId;
      let topicData = onChangeSectionData;
      //console.log("topicData: ", topicData)   
      editsectiondata({ sectionid, topicData, setRerender });
      //putsectiondata({sectionid,topicData, setRerender});
      setShowSectionEdit({ chapterId: 0, sectionId: 0 });
      //setRerender(rerender=>!rerender);

   }



   //console.log("onChangeSectionData: ", onChangeSectionData);

   const [sectionText, setSectionText] = useState({});


   //const sectionText = useMemo(() => {}, []);

   //const sectionText={};	

   useEffect(() => {

      let sectionData = "";

      syllabusData.chapters.forEach((chapter, cindex) => {

         chapter.sections.forEach((section, sindex) => {

            sectionData = "";
            section.topics.forEach((topic, tindex) => {

               sectionData = sectionData + topic.name;

            });
            let chapterId = chapter.id;
            let sectionId = section.id;
            let secName = 'c' + chapterId + 's' + sectionId;
            sectionText[secName] = sectionData;

         });

      });

   }, [syllabusData, sectionText]);





   const [showChapterCreateForm, setShowChapterCreateForm] = useState(false);

   const addChapterHandler = () => {

      //console.log("New chapter added");
      // let chapterPostData = {"name":"New Section","chapternum": };
      // createnewchapter({chapterPostData});	    
      setShowChapterCreateForm(true);

   }

   const closeChapterFormHandler = () => {
      setShowChapterCreateForm(false);
      props.rerender();
   }


   const deleteChapterHandler = ({ chapterId }) => {
      //console.log("ChapterId: ", chapterId);
      //console.log("SyllabusId: ", syllabusData.id);
      deletechapterdata({ chapterId, props });

   }



   const [editMode, setEditMode] = useState(false);


   const handleChangeEditMode = () => {
      setEditMode(editMode => !editMode);
      setShowSectionEdit(false);
   }



   const editChapterTitleHandler = () => {
      //console.log("show chapter ediasdasdt form");
      setShowChapterEditForm(true);

   }






   //console.log("showSectionEdit.chapterId:   ",showSectionEdit.chapterId,'---', showSectionEdit.sectionId);
   //for (const [sindex, section] of SortedSections.entries())
   //let SortedSections = new Map([...sections.entries()].sort((a,b)=> a.id< b.id));

   //console.log("syllabusData: ", syllabusData);


   //console.log("---is Owner: ", props);

   return (

      <div className={classes.courseSyllabus}>

         <span className={classes.title}>Chapters</span>
         {(props.isOwner || props.isAdmin || props.isTeacher) &&
            <div className={classes.topBarSyllabus}>

               <button type="button" className={classes.topBarSyllabus_button}>Reset To default </button>
               <button type="button" className={classes.topBarSyllabus_button}>Import a syllabus </button>

               <div className={classes.toggleSwitch}>
                  {<Switch onChange={handleChangeEditMode}
                     checked={editMode}
                     onColor="#0056D2"
                     offColor="#D3D3D3"
                  />
                  }
                  {editMode && <span style={{ marginLeft: "20px" }}> Edit mode ON  </span>}
                  {!editMode && <span style={{ marginLeft: "20px" }}> Edit mode OFF </span>}
               </div>

            </div>}

         {syllabusData.length !== null && <div className={classes.syllabusContent}>



            <ol className={classes.chapterNames}>
               {editMode &&
                  <AddChapterButton addChapterHandler={addChapterHandler} />
               }

               {showChapterCreateForm && <ChapterCreationForm onPress={closeChapterFormHandler}
                  syllabusData={syllabusData}
               />
               }

               {/*showChapterEditForm && <ChapterEditForm onPress={closeChapterFormHandler} syllabusData={syllabusData}/>*/}




               {
   syllabusData.chapters.map((chapter) => {
      let chapterId = chapter.id;
      let sections = chapter.sections;

      return (
         <li className={classes.chaptersList} key={chapterId}>
            . <b>{chapter.name}</b>
            {editMode && (
               <>
                  <button type="button" className={classes.deleteChapterButton} onClick={editChapterTitleHandler}>
                     <BiEdit />
                  </button>
                  <button type="button" className={classes.deleteChapterButton} onClick={() => deleteChapterHandler({ chapterId })}>
                     <BsTrash />
                  </button>
               </>
            )}
            <ol className={classes.sectionlist}>
               {sections.map((section) => {
                  let csname = 'c' + chapter.id + 's' + section.id;

                  return (
                     <div className={classes.section} key={section.id}>
                        <SectionIter
                           sectionEditStyle={sectionEditStyle}
                           showSectionEdit={showSectionEdit}
                           chapter={chapter}
                           section={section}
                           editSectionHandler={editSectionHandler}
                           deleteSectionHandler={deleteSectionHandler}
                           SaveSectionHandler={SaveSectionHandler}
                           csname={csname}
                           handleChange={handleChange}
                           sectionText={sectionText}
                           editMode={editMode}
                        />
                     </div>
                  );
               })}
               {editMode && (
                  <AddSectionButton addSectionHandler={(event) => addSectionHandler({ chapterId })} />
               )}
            </ol>
         </li>
      );
   })
}

            </ol>
         </div>}

      </div>

   );

}

export default CourseSyllabus;



/*

 { !showSyllabus && <button onClick={showSyllabusHandler}> Show <BsChevronDoubleDown className={classes.ExpandSyllIcon}/>  </button> }

        { showSyllabus && <button onClick={hideSyllabusHandler}> Hide <BsChevronDoubleUp className={classes.ExpandSyllIcon}/>  </button>}
*/
