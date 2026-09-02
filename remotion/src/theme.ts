export const C = {
  blue: "#074F98",
  blueDeep: "#052F5C",
  green: "#275432",
  brown: "#986135",
  gold: "#E1AD40",
  cream: "#E9D8B8",
  ink: "#0B1620",
  paper: "#F7F3EA",
};

export const grad = (a: string, b: string, deg = 135) =>
  `linear-gradient(${deg}deg, ${a} 0%, ${b} 100%)`;
