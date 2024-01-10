import { Link } from "@mui/material";
import Box from "@mui/material/Box";
import "./Profile.css";

export interface ProfileProps {
  name: string;
  text: string;
  link?: string;
  imgPath?: string;
}

function Profile(props: ProfileProps) {
  const Name = () => <Box className="profile-name">{props.name}</Box>
  const NameWithLink = props.link
    ? () => <Box className="profile-name"><a href={props.link}>{props.name}</a></Box>
    : Name

  return (
    <Box sx={{ height: "100%" }}>
      <Box className="profile-container">
        {/* <img
          className="profile-picture"
          src="/portrait.png"
          alt="profile"
        /> */}
        <NameWithLink></NameWithLink>
        <Box className="profile-text">{props.text}</Box>
      </Box>
      {/* <Box className="social-links-about">
        <Link
          className="social-1"
          href="http://www.google.com"
          target="_blank"
        />
        <Link
          className="social-2"
          href="http://www.google.com"
          target="_blank"
        />
        <Link
          className="social-3"
          href="http://www.google.com"
          target="_blank"
        />
        <Link
          className="social-4"
          href="http://www.google.com"
          target="_blank"
        />
      </Box> */}
    </Box>
  );
}

export default Profile;
