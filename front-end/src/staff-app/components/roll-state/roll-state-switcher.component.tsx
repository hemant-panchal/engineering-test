import React, { useState, useEffect } from "react"
import { Person } from "shared/models/person"
import { RolllStateType } from "shared/models/roll"
import { RollStateIcon } from "staff-app/components/roll-state/roll-state-icon.component"

interface Props {
  initialState?: RolllStateType
  size?: number
  student: Person
  onStateChange?: (newState: RolllStateType) => void
  onRoleSwitch: (value: object) => object
}
export const RollStateSwitcher: React.FC<Props> = ({ initialState = "unmark", size = 40, student, onStateChange, onRoleSwitch }) => {
  const [rollState, setRollState] = useState(initialState)
  
  const nextState = () => {
    const states: RolllStateType[] = ["present", "late", "absent"]
    if (rollState === "unmark" || rollState === "absent") return states[0]
    const matchingIndex = states.findIndex((s) => s === rollState)
    return matchingIndex > -1 ? states[matchingIndex + 1] : states[0]
  }

  const onClick = () => {
    const next = nextState()
    student.roll = next
    setRollState(next)
    onRoleSwitch(student)
    if (onStateChange) {
      onStateChange(next)
    }
  }

  return <RollStateIcon type={rollState} size={size} onClick={onClick} />
}
