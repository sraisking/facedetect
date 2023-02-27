import { FaceMesh } from "@mediapipe/face_mesh";
import Box from '@mui/material/Box';
import React, { useRef, useEffect, useState } from "react";
import * as FaceDetection from "@mediapipe/face_detection";
import * as cam from "@mediapipe/camera_utils";
import Webcam from "react-webcam";
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel'
import Countdown from 'react-countdown';
import Modal from '@mui/material/Modal';
const mockExamData = [
  {
    question: "Question 1",
    options: [{ label: 'ans1', value: 'ans1' }, { label: 'ans1', value: 'ans1' }, { label: 'ans1', value: 'ans1' }]
  },
  {
    question: "Question 2",
    options: [{ label: 'ans1', value: 'ans1' }, { label: 'ans1', value: 'ans1' }, { label: 'ans1', value: 'ans1' }]
  },
  {
    question: "Question 3",
    options: [{ label: 'ans1', value: 'ans1' }, { label: 'ans1', value: 'ans1' }, { label: 'ans1', value: 'ans1' }]
  },
  {
    question: "Question 4 ",
    options: [{ label: 'ans1', value: 'ans1' }, { label: 'ans1', value: 'ans1' }, { label: 'ans1', value: 'ans1' }]
  }
]
const mockExamTime = 20000;
const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

function App() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [timeOver, setTimeOver] = useState(true)
  const [testSubmitted, setTestSubmitted] = useState(false)
  const [testStartCounter, setTestStartCounter] = useState(0)
  const [testStarted, setTestStarted] = useState(false);
  const [multipleFacesDetected, setMultipleFacesDetected] = useState(false)
  const [abort, setAbort] = useState(false)
  const [emptyAreaWarningCount, setEmptyAreaWarningCount] = useState(0);
  const [emptyArea, setEmptyArea] = useState(false)
  const handleClose = () => {
    setMultipleFacesDetected(false);
    setAbort(true)
  }
  const handleCloseWarning=()=>{
    setEmptyArea(false)
    if(emptyAreaWarningCount>0) setAbort(true)
  }
  const connect = window.drawConnectors;
  var camera = null;
  function onResults(results) {
    console.log(results.detections);
    if (results.detections.length == 0) {
      console.log(emptyAreaWarningCount);
      let count = emptyAreaWarningCount;
      setEmptyAreaWarningCount(count=+1);
      setEmptyArea(true);
    }
    if (results.detections.length > 1) {
      setMultipleFacesDetected(true)
      console.log("More tan 1 ===>", results.detections.length, results);
    }
  }

  useEffect(() => {
    if (!abort) {
      const faceDetection = new FaceDetection.FaceDetection({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection@0.4/${file}`;
        }
      });
      faceDetection.setOptions({
        model: 'short',
        minDetectionConfidence: 0.5
      });
      faceDetection.onResults(onResults);

      camera = new cam.Camera(webcamRef.current.video, {
        onFrame: async () => {
          await faceDetection.send({ image: webcamRef.current.video });
        },
        width: 300,
        height: 300
      });
      camera.start();
    }

  }, [abort]);
  const onExamOver = () => {
    console.log("Exam is over");
  }
  const onTestSubmit = () => {
    setTestSubmitted(true)
  }
  const onTestStart = () => {
    let temp = testStartCounter
    setTimeOver(false)
    setTestStarted(true)
    setTestStartCounter(++temp)
  }
  if (abort) {
    return (
      <Grid container direction='column'>
        <Grid item>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            You have violated Guidelines of the exam
          </Typography>
        </Grid>
        <Grid item>
          <Typography id="modal-modal-description" variant="h6" component="h2">
            Contact Your Admin to resolve.
          </Typography>
        </Grid>
      </Grid>
    )
  }
  return (
    <Grid container spacing={2} direction='column'>
      <Modal
        open={multipleFacesDetected}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Multiple Faces Detected
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            Contact Your Admin to resolve.
          </Typography>
        </Box>
      </Modal>
      <Modal
        open={emptyArea}
        onClose={handleCloseWarning}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
           Area is Empty . Warning number ${emptyAreaWarningCount}. Will be terminated in next warning
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
           Please sit intact in front of PC to avoid termination
          </Typography>
        </Box>
      </Modal>
      <Grid item>
        <Countdown date={Date.now() + mockExamTime} onComplete={onExamOver} />,
      </Grid>
      <Grid item >
        <Webcam
          ref={webcamRef}
          style={{
            marginLeft: "auto",
            marginRight: "auto",
            left: 0,
            right: 0,
            textAlign: "center",
            width: 300,
            height: 300,
          }}
        />

      </Grid>
      <Grid item>
        <Button variant="contained" size="medium" onClick={onTestStart}>
          Start Exam
        </Button>
      </Grid>
      {testSubmitted && <Typography> You have already Submitted your exam</Typography>}
      {timeOver && <Typography> Assignment Time is over. Please contact your admin</Typography>}
      {
        !timeOver && !testSubmitted && mockExamData.map((data, index) => {
          return (
            <Grid item key={`${index}${data.question}`}>
              <FormControl>
                <FormLabel id="demo-radio-buttons-group-label">{data.question}</FormLabel>
                <RadioGroup
                  aria-labelledby="demo-radio-buttons-group-label"
                  name="radio-buttons-group"
                >
                  <FormControlLabel value={data.options[0].value} control={<Radio />} label={data.options[0].label} />
                  <FormControlLabel value={data.options[0].value} control={<Radio />} label={data.options[0].label} />
                  <FormControlLabel value={data.options[0].value} control={<Radio />} label={data.options[0].label} />
                </RadioGroup>
              </FormControl>

            </Grid>
          )
        })
      }
      {!testSubmitted && testStarted && <Button variant="contained" size="medium" onClick={onTestSubmit}>
        Submit
      </Button>}

    </Grid>
  );
}

export default App;
