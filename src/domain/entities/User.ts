export interface User {
  userID: string;
  username: string;
  email: string;
  phoneNumber: string;
  stationName: string | null;
  roleName: "Admin" | "Staff" | "Driver";
}
