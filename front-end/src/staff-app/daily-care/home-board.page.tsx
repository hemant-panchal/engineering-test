import React, { useState, useEffect } from "react"
import styled from "styled-components"
import Button from "@material-ui/core/ButtonBase"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Spacing, BorderRadius, FontWeight } from "shared/styles/styles"
import { Colors } from "shared/styles/colors"
import { CenteredContainer } from "shared/components/centered-container/centered-container.component"
import { Person } from "shared/models/person"
import { useApi } from "shared/hooks/use-api"
import { StudentListTile } from "staff-app/components/student-list-tile/student-list-tile.component"
import { ActiveRollOverlay, ActiveRollAction } from "staff-app/components/active-roll-overlay/active-roll-overlay.component"
import { RollInput } from "shared/models/roll"
import { RolllStateType } from "shared/models/roll"

export const HomeBoardPage: React.FC = () => {
  const [isRollMode, setIsRollMode] = useState(false)
  const [getStudents, data, loadState] = useApi<{ students: Person[] }>({ url: "get-homeboard-students" })
  const [saveRoll] = useApi<{ params: RollInput }>({ url: "save-roll" })
  const [students, setStudents] = React.useState<Person[]>([]);
  const [studentsCopy, setStudentsCopy] = React.useState<Person[]>([]);
  const [sortType, setSortType] = React.useState<keyof Person>("first_name");
  const [sortDir, setSortDir] = useState("asc");
  const [inputText, setInputText] = useState("");
  const [rollStateList, setRollStateList] = useState([])
  let stateListTemp = [
    { type: "all", count: 0 },
    { type: "present", count: 0 },
    { type: "late", count: 0 },
    { type: "absent", count: 0 },
  ]
  const filterData = students.filter((el) => {
    if (!inputText || !inputText.length) {
        return el;
    }
    else {
        return (el.first_name.toLowerCase().includes(inputText.toLocaleLowerCase()) || el.last_name.toLowerCase().includes(inputText.toLocaleLowerCase()))
    }
  })
  useEffect(() => {
    void getStudents()
    setRollStateList(stateListTemp);
  }, [getStudents])

  useEffect(() => {
    if(data?.students){
      setStudents(data.students)
      setStudentsCopy(data.students)
    }
  }, [data])

  const sortStudentsAscendingOrder = (StudentsParam: Person[] = students) => {
    const sortArray = [...StudentsParam].sort((a: Person, b: Person) => {
      if (a[sortType] > b[sortType]) return 1;
      else if (b[sortType] > a[sortType]) return -1;
      return 0;
    });
    setStudents(sortArray);   
  }
  const sortStudentsDescendingOrder = (StudentsParam: Person[] = students) => {
    const sortArray = [...StudentsParam].sort((a: Person, b: Person) => {
      if (a[sortType] > b[sortType]) return -1;
      else if (b[sortType] > a[sortType]) return 1;
      return 0;
    });
    setStudents(sortArray); 
  }

  const onToolbarAction = (action: ToolbarAction, sortKey: ToolbarKey) => {
    if (action === "roll") {
      setIsRollMode(true)
    }else if(action === "sort"){
      setSortType(sortKey)
      if(sortDir == "asc"){
        setSortDir("dec");
        sortStudentsAscendingOrder(students);
      }else{
        setSortDir("asc")
        sortStudentsDescendingOrder(students);
      }
      
    }
  }
  const onStudentSearch =  (value: string) => {
    setInputText(value.toLowerCase())
  }
  const setParams = () => {
    const student_roll_states = []
    students.map((stu) => {
      if(stu.roll){
       const obj = {}
       obj.student_id = stu.id
       obj.roll_state = stu.roll
       student_roll_states.push(obj)
      }
    });
    saveRoll(student_roll_states)
  }

  const filterByRole = (value: string) => {
    let newArr:Person[] = []
    const stuCopy:Person[] = studentsCopy
    if (value == "all") {
      newArr = stuCopy
    }else{
      stuCopy.map((stu) => {
        if ((value != "all") && (stu.roll && stu.roll == value)) {
          newArr.push(stu); 
        }
      })
    }
    
    setStudents(newArr);
  }

  const onActiveRollAction = (action: ActiveRollAction) => {
    if (action === "exit") {
      setIsRollMode(false)
    }else{
      setParams()
    }
  }
  const getcount = (type) => {
    let count = 0;
    students.map((stu) => {
      if (stu.roll && stu.roll == type) {
        count += 1;
      }else if (type == "all"){
        count = students.length
      }
    })
    return count;
  }
  const rollChanged = (student: Person) => {
    students.map((newStudent) => {
      if(newStudent.id == student.id && student.roll){
        newStudent.roll = student.roll
      }
    }); 
    setStudents(students)
    stateListTemp.map((roll) => {
      roll.count = getcount(roll.type)
    });
    setRollStateList(stateListTemp);
  }
  
    
  return (
    <>
      <S.PageContainer>
        <Toolbar onItemClick={onToolbarAction} onItemSearch={onStudentSearch}/>

        {loadState === "loading" && (
          <CenteredContainer>
            <FontAwesomeIcon icon="spinner" size="2x" spin />
          </CenteredContainer>
        )}

        {loadState === "loaded" && filterData && (
          <>
            {filterData.map((s) => (
              <StudentListTile key={s.id} isRollMode={isRollMode} student={s} onRollChange={rollChanged}/>
            ))}
          </>
        )}

        {loadState === "error" && (
          <CenteredContainer>
            <div>Failed to load</div>
          </CenteredContainer>
        )}
      </S.PageContainer>
      <ActiveRollOverlay isActive={isRollMode} onItemClick={onActiveRollAction} stateList={rollStateList} onRollClick={filterByRole}/>
    </>
  )
}

type ToolbarAction = "roll" | "sort"
type ToolbarKey = "first_name"
interface ToolbarProps {
  onItemClick: (action: ToolbarAction, sortKey: ToolbarKey, value?: string) => void
}
const Toolbar: React.FC<ToolbarProps> = (props) => {
  const { onItemClick, onItemSearch } = props
  return (
    <S.ToolbarContainer>
      <S.Toggle onClick={() => onItemClick("sort", "first_name")}>First Name</S.Toggle>
      <S.Toggle onClick={() => onItemClick("sort", "last_name")}>Last Name</S.Toggle>
      <SearchBar onChange={(e) => onItemSearch(e.target.value)}></SearchBar>
      <S.Button onClick={() => onItemClick("roll")}>Start Roll</S.Button>
    </S.ToolbarContainer>
  )
}
interface SearchProps {
  onChange: (value?: string) => string
}
const SearchBar: React.FC<SearchProps> = (props) => {
  const { onChange } = props
  return (
    <div className="Search">
      <input
        className="SearchInput"
        type="text"
        onChange={onChange}
        placeholder="Search"
      />
    </div>
  );
};

const S = {
  PageContainer: styled.div`
    display: flex;
    flex-direction: column;
    width: 50%;
    margin: ${Spacing.u4} auto 140px;
  `,
  ToolbarContainer: styled.div`
    display: flex;
    justify-content: space-around;
    align-items: center;
    color: #fff;
    background-color: ${Colors.blue.base};
    padding: 6px 14px;
    font-weight: ${FontWeight.strong};
    border-radius: ${BorderRadius.default};
  `,
  Button: styled(Button)`
    && {
      padding: ${Spacing.u2};
      font-weight: ${FontWeight.strong};
      border-radius: ${BorderRadius.default};
    }
  `,
  Toggle: styled(Button)`
    && {
      padding: ${Spacing.u2};
      font-weight: ${FontWeight.strong};
      border-radius: ${BorderRadius.default};
    }
  `,
}
