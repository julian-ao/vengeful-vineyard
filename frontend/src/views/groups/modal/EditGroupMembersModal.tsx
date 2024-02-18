import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Dispatch, FC, Fragment, SetStateAction, useEffect, useRef, useState } from "react"
import { Listbox, ListboxOption } from "../../../components/listbox/Listbox"
import {
  VengefulApiError,
  getDeleteGroupMemberUrl,
  getPatchGroupMemberPermissionsUrl,
  getTransferGroupOwnershipUrl,
  useGroupLeaderboard,
} from "../../../helpers/api"
import { canGiveRole, hasPermission } from "../../../helpers/permissions"

import { Transition } from "@headlessui/react"
import axios from "axios"
import { Button } from "../../../components/button"
import { PersonSelect } from "../../../components/input/PersonSelect"
import { Modal } from "../../../components/modal"
import { Spinner } from "../../../components/spinner"
import { useCurrentUser } from "../../../helpers/context/currentUserContext"
import { useGroupNavigation } from "../../../helpers/context/groupNavigationContext"
import { useConfirmModal } from "../../../helpers/context/modal/confirmModalContext"
import { useNotification } from "../../../helpers/context/notificationContext"
import { GroupUser } from "../../../helpers/types"

interface EditGroupMembersModalProps {
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
}

export const EditGroupMembersModal: FC<EditGroupMembersModalProps> = ({ open, setOpen }) => {
  const { selectedGroup } = useGroupNavigation()
  const { currentUser } = useCurrentUser()
  const { setNotification } = useNotification()
  const ref = useRef(null)
  const queryClient = useQueryClient()

  const {
    setOpen: setConfirmModalOpen,
    setType: setConfirmModalType,
    setOptions: setConfirmModalOptions,
  } = useConfirmModal()

  const [members, setMembers] = useState<GroupUser[]>([])

  const [selectedPerson, setSelectedPerson] = useState<GroupUser | undefined>(undefined)
  const [currentRole, setCurrentRole] = useState<string>("")
  const [currentRolesOptions, setCurrentRolesOptions] = useState<ListboxOption<string>[]>([])

  const isCurrentUserSelected = selectedPerson?.user_id === currentUser.user_id
  const [currentUserRole, setCurrentUserRole] = useState<string>("")

  // Handlers and stuff

  const { data: groupData } = useGroupLeaderboard(
    selectedGroup?.group_id,
    (group) => {
      const newMembers = [...group.members]
      newMembers.sort((a, b) => `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`))
      setMembers(newMembers)

      const newSelectedPerson = newMembers.find((member) => member.user_id === selectedPerson?.user_id)
      setSelectedPerson(newSelectedPerson ? newSelectedPerson : newMembers[0])
    },
    {
      enabled: !!selectedGroup,
    }
  )

  useEffect(() => {
    if (!selectedPerson) return

    const role = selectedPerson.permissions.at(0) ?? ""
    setCurrentRole(role)

    const newRolesOptions =
      groupData?.roles.map(([roleName, rolePermission]) => ({
        label: roleName,
        value: rolePermission,
        disabled: false,
      })) ?? []

    const groupRoles = groupData?.roles ?? []
    const groupPermissions = groupData?.permissions ?? {}
    const isCurrentUser = selectedPerson.user_id === currentUser.user_id

    newRolesOptions.forEach((option) => {
      const canGiveRoleCheck = canGiveRole(groupRoles, groupPermissions, option.value, currentUserRole)
      console.log(option.value, canGiveRoleCheck)
      if (
        (isCurrentUser && (currentUserRole === "group.owner" || !canGiveRoleCheck)) ||
        (!isCurrentUser && !canGiveRoleCheck)
      ) {
        option.disabled = true
      } else {
        option.disabled = false
      }
    })
    setCurrentRolesOptions(newRolesOptions)
  }, [selectedPerson])

  useEffect(() => {
    setCurrentUserRole(
      groupData?.members.find((member) => member.user_id === currentUser.user_id)?.permissions.at(0) ?? ""
    )
  }, [currentUser, groupData])

  const { mutate: transferOwnershipMutate } = useMutation(
    async () =>
      await axios.post(getTransferGroupOwnershipUrl(selectedGroup?.group_id ?? "", selectedPerson?.user_id ?? "")),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["groupLeaderboard", selectedGroup?.group_id] })
        setNotification({
          type: "success",
          text: "Lederskap ble overført",
        })
      },
      onError: (e: VengefulApiError) => {
        setNotification({
          type: "error",
          title: "Lederskap kunne ikke overføres",
          text: e.response.data.detail,
        })
      },
    }
  )

  const { mutate: removeMemberMutate } = useMutation(
    async () =>
      await axios.delete(getDeleteGroupMemberUrl(selectedGroup?.group_id ?? "", selectedPerson?.user_id ?? "")),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["groupLeaderboard", selectedGroup?.group_id] })
        setNotification({
          type: "success",
          text: "Medlem ble fjernet",
        })
      },
      onError: (e: VengefulApiError) => {
        setNotification({
          type: "error",
          title: "Medlem kunne ikke fjernes",
          text: e.response.data.detail,
        })
      },
    }
  )

  const { mutate: changeRoleMutate } = useMutation(
    async () =>
      await axios.patch(
        getPatchGroupMemberPermissionsUrl(selectedGroup?.group_id ?? "", selectedPerson?.user_id ?? ""),
        { privilege: currentRole }
      ),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["groupLeaderboard", selectedGroup?.group_id] })
        setNotification({
          type: "success",
          text: "Rolle ble endret",
        })
      },
      onError: (e: VengefulApiError) => {
        setNotification({
          type: "error",
          title: "Rolle kunne ikke endres",
          text: e.response.data.detail,
        })
      },
    }
  )

  return (
    <Transition.Root show={open} as={Fragment}>
      <Modal
        ref={ref}
        title="Rediger gruppemedlemmer"
        description="Her kan du redigere gruppemedlemmer"
        setOpen={setOpen}
        includePrimaryButton={false}
        cancelButtonLabel="Lukk"
      >
        <div className="mb-4 md:mt-2 flex flex-col gap-6 font-normal">
          {!groupData ? (
            <Spinner />
          ) : (
            <>
              <div className="w-64"></div>

              <div className="flex flex-col gap-y-4">
                <PersonSelect
                  label="Rediger gruppemedlem"
                  members={members}
                  selectedPerson={selectedPerson}
                  setSelectedPerson={setSelectedPerson}
                />
                <div className="flex flex-col gap-y-3 w-full border-l-2 border-l-gray-500/50 pl-3">
                  <Listbox
                    label="Rolle"
                    options={currentRolesOptions}
                    value={currentRole}
                    onChange={(value) => setCurrentRole(value)}
                  />
                  <Button
                    variant="OUTLINE"
                    label="Endre rolle"
                    color="BLUE"
                    disabled={
                      !currentRolesOptions.find((option) => !option.disabled) ||
                      currentRole === (selectedPerson?.permissions.at(0) ?? "")
                    }
                    onClick={() => {
                      if (isCurrentUserSelected) {
                        setConfirmModalType("YESNO")
                        setConfirmModalOptions({
                          message:
                            "Dersom du bytter rolle på deg selv vil du ikke selv ville gjenopprette den gamle rollen din",
                          onClose: (retval) => {
                            if (retval) {
                              changeRoleMutate()
                            }
                          },
                        })
                        setConfirmModalOpen(true)
                      } else {
                        changeRoleMutate()
                      }
                    }}
                  />
                </div>

                <div className="flex flex-col gap-y-3">
                  {hasPermission(groupData.permissions, "group.ownership.transfer", currentUserRole) && (
                    <Button
                      variant="OUTLINE"
                      label="Overfør lederskap"
                      color="RED"
                      onClick={() => {
                        setConfirmModalType("INPUT")
                        setConfirmModalOptions({
                          primaryButtonLabel: "Overfør",
                          cancelButtonLabel: "Avbryt",
                          inputKeyword: "Overfør",
                          onClose: (retval) => {
                            if (retval) {
                              transferOwnershipMutate()
                            }
                          },
                        })
                        setConfirmModalOpen(true)
                      }}
                      disabled={isCurrentUserSelected}
                    />
                  )}

                  {hasPermission(groupData.permissions, "group.members.remove", currentUserRole) && (
                    <Button
                      variant="OUTLINE"
                      label="Fjern fra gruppa"
                      color="RED"
                      onClick={() => {
                        setConfirmModalType("YESNO")
                        setConfirmModalOptions({
                          onClose: (retval) => {
                            if (retval) {
                              removeMemberMutate()
                            }
                          },
                        })
                        setConfirmModalOpen(true)
                      }}
                      disabled={isCurrentUserSelected}
                    />
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </Modal>
    </Transition.Root>
  )
}