import { createContext } from "react"

interface UserType {
  user_id: string
}

export const UserContext = createContext<{
  user: UserType
  setUser: (user: UserType) => void
}>({
  user: {
    user_id: "",
  },
  setUser: () => {},
})
