import { Box } from "@mui/material";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { themeModes } from "../../configs/theme.configs";
import showdropLogoDark from "../../assets/showdrop-logo-dark.png";
import showdropLogoLight from "../../assets/showdrop-logo-light.png";

const Logo = () => {
  const { themeMode } = useSelector((state) => state.themeMode);
  const logoSrc = themeMode === themeModes.light ? showdropLogoLight : showdropLogoDark;

  return (
    <Box
      component={Link}
      to="/"
      sx={{
        display: "inline-flex",
        alignItems: "center",
        textDecoration: "none",
        lineHeight: 0
      }}
    >
      <Box
        component="img"
        src={logoSrc}
        alt="ShowDrop"
        sx={{
          height: { xs: 48, md: 64 },
          width: "auto",
          display: "block"
        }}
      />
    </Box>
  );
};

export default Logo;
