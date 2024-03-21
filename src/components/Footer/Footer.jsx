import { Typography } from "@mui/material";
import Link from "@mui/material/Link";
import "./Footer.styles.css";

const Footer = () => {
  return (
    <footer className="footer">
      <Typography variant="body2" color="textSecondary" align="center">
        {"Copyright © "}
        <Link color="inherit" href="https://nraccounting.ca">
          NR Accounting & Business Advisors Inc.
        </Link>{" "}
        {new Date().getFullYear()}
        {"."}
      </Typography>
    </footer>
  );
}

export default Footer;