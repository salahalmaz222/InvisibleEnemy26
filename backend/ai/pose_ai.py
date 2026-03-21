
import cv2
import mediapipe as mp

mp_pose = mp.solutions.pose
pose = mp_pose.Pose()

def run_pose_ai():
    cap=cv2.VideoCapture(0)

    while True:
        ret,frame=cap.read()
        if not ret:
            break

        rgb=cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        result=pose.process(rgb)

        if result.pose_landmarks:
            mp.solutions.drawing_utils.draw_landmarks(
                frame,
                result.pose_landmarks,
                mp_pose.POSE_CONNECTIONS
            )

        cv2.imshow("AI Trainer", frame)

        if cv2.waitKey(1)==27:
            break

    cap.release()
    cv2.destroyAllWindows()
