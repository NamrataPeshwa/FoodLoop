import * as React from "react";
import { Box, Modal, Paper, Fade } from "@mui/material";

// Your form component (you said it's called X)
// import X from './X'; // <-- Update this import based on your file structure
import FoodDonationRequestForm from "./RequestForm";
import { PlusIcon } from "lucide-react";

const style = {
  position: "fixed",
  bottom: 20,
  right: 20,
  padding: "8px 17px",
  backgroundColor: "#1976d2",
  color: "#fff",
  borderRadius: "30px",
  cursor: "pointer",
  transition: "all 0.3s ease",
  overflow: "hidden",
  whiteSpace: "nowrap",
  textOverflow: "ellipsis",
  maxWidth: "48px",
  "&:hover": {
    maxWidth: "300px",
    boxShadow: 6,
  },
};

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "35rem",
  bgcolor: "background.paper",
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
};

export default function FloatingFormWidget() {
  const [openModal, setOpenModal] = React.useState(false);
  const isMounted = React.useRef(true);

  React.useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleOpen = () => {
    if (isMounted.current) {
      setOpenModal(true);
    }
  };

  const handleClose = () => {
    if (isMounted.current) {
      setOpenModal(false);
    }
  };

  return (
    <React.Fragment>
      <Paper
        sx={style}
        elevation={4}
        onClick={handleOpen}
        title="Click to open form"
        className="flex items-center"
      >
        <span className="text-2xl">+</span> 
        <span className="px-4 ">Request Food Donation</span>
      </Paper>

      <Modal
        open={openModal}
        onClose={handleClose}
        closeAfterTransition
        keepMounted // this helps prevent errors too
      >
        <Fade in={openModal}>
          <Box sx={modalStyle}>
            <FoodDonationRequestForm handleClose={handleClose} />
          </Box>
        </Fade>
      </Modal>
    </React.Fragment>
  );
}
