import { writable, derived } from "svelte/store";
import type { User, PunishmentType } from "../types";

// const defaultusers: User[] = [
//   {
//     user_id: 1,
//     first_name: "noen",
//     last_name: "noensen",
//     email: "kldjlksa@klsjda.dn",
//     active: true,
//     punishments: [
//       {
//         punishment_type: 1,
//         reason: "vin",
//         amount: 1,
//         punishment_id: 1,
//         created_time: "2022-02-13T18:54:50",
//         verified_time: null,
//         verified_by: null,
//       },
//       {
//         punishment_type: 2,
//         reason: "sprit",
//         amount: 1,
//         punishment_id: 2,
//         created_time: "2022-02-13T18:54:55",
//         verified_time: null,
//         verified_by: null,
//       },
//       {
//         punishment_type: 3,
//         reason: "vaffel",
//         amount: 1,
//         punishment_id: 3,
//         created_time: "2022-02-13T18:55:03",
//         verified_time: null,
//         verified_by: null,
//       },
//     ],
//   },
//   {
//     user_id: 2,
//     first_name: "Vigdis-Irene",
//     last_name: "Steinsund",
//     email: "vigdis.steinsund@hotmail.com",
//     active: true,
//     punishments: [
//       {
//         punishment_type: 1,
//         reason: "string",
//         amount: 1,
//         punishment_id: 4,
//         created_time: "2022-02-13T18:54:50",
//         verified_time: null,
//         verified_by: null,
//       },
//     ],
//   },
// ];

function hasCommonElement(arr1, arr2): boolean {
  return arr1.some((item) => arr2.includes(item));
}

export const term = writable<string>("");
export const users = writable<User[]>(
  JSON.parse(localStorage.getItem("users"))
);
export const showInactive = writable<boolean>();
export const showPaid = writable<boolean>();
export const filterOnPunishments = writable<PunishmentType[]>();

export const filteredUsers = derived(
  [term, users, showInactive, filterOnPunishments],
  ([$term, $users, $showInactive, $filterOnPunishments]) =>
    $users
      .filter((user) => ($showInactive ? user : user.active))
      .filter(
        (user) =>
          user.first_name.toLocaleLowerCase().includes($term) ||
          user.last_name.toLocaleLowerCase().includes($term)
      )
);

users.subscribe((value) => (localStorage.users = JSON.stringify(value)));
