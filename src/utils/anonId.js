import { v4 as uuidv4 } from "uuid";

export function getAnonId() {
  let id = localStorage.getItem("kp_anon_id");
  if (!id) {
    id = uuidv4();
    localStorage.setItem("kp_anon_id", id);
  }
  return id;
}