import cv2
import face_recognition
import numpy as np
import os
import sys

def verify_voter(voter_id, tolerance=0.5):
    encodings_dir = "encodings"
    face_rec_file = os.path.join(encodings_dir, f"{voter_id}_face_recognition.npy")

    if not os.path.exists(face_rec_file):
        print("[ERROR] No encoding file found for this voter.")
        return False

    stored_encodings = np.load(face_rec_file)

    cap = cv2.VideoCapture(0)
    print("[INFO] Please look at the camera...")

    while True:
        ret, frame = cap.read()
        if not ret:
            continue

        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        face_locations = face_recognition.face_locations(rgb)
        face_encodings = face_recognition.face_encodings(rgb, face_locations)

        for face_encoding in face_encodings:
            matches = face_recognition.compare_faces(stored_encodings, face_encoding, tolerance)
            distances = face_recognition.face_distance(stored_encodings, face_encoding)

            best_match_index = np.argmin(distances)
            if matches[best_match_index]:
                print(f"[SUCCESS] Voter {voter_id} verified! (Distance: {distances[best_match_index]:.4f})")
                cap.release()
                cv2.destroyAllWindows()
                return True
            else:
                print(f"[FAILED] Face does not match (Best Distance: {distances[best_match_index]:.4f})")

        cv2.imshow("Verification", frame)

        if cv2.waitKey(1) & 0xFF == ord("q"):
            break

    cap.release()
    cv2.destroyAllWindows()
    return False

if __name__ == "__main__":
    voter_id = sys.argv[1]
    if verify_voter(voter_id):
        print("SUCCESS")
    else:
        print("FAILED")
