import * as React from 'react';
import { Button, Box, Modal, TextField, Typography, Fade, Paper } from '@mui/material';

const style = {
  position: 'fixed',
  bottom: 20,
  right: 20,
  padding: '10px 20px',
  backgroundColor: '#1976d2',
  color: '#fff',
  borderRadius: '30px',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
  maxWidth: '200px',
  '&:hover': {
    maxWidth: '300px',
    boxShadow: 6,
  },
};

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
};

export default function FloatingFormWidget() {
  const [openModal, setOpenModal] = React.useState(false);

  const handleOpen = () => setOpenModal(true);
  const handleClose = () => setOpenModal(false);

  return (
    <React.Fragment>
      <Paper
        sx={style}
        elevation={4}
        onClick={handleOpen}
        title="Click to open form"
      >
        🚀Place Order Now!
      </Paper>

      <Modal
        open={openModal}
        onClose={handleClose}
        closeAfterTransition
      >
        <Fade in={openModal}>
          <Box sx={modalStyle}>
           <RequestForm handleClose={handleClose} />
          </Box>
        </Fade>
      </Modal>
    </React.Fragment>
  );
}
