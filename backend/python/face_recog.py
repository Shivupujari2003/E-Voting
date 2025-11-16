# import cv2
# import face_recognition
# import numpy as np
# import os
# import sys

# def verify_voter(voter_id, tolerance=0.5):
#     encodings_dir = "encodings"
#     face_rec_file = os.path.join(encodings_dir, f"{voter_id}_face_recognition.npy")

#     if not os.path.exists(face_rec_file):
#         print("[ERROR] No encoding file found for this voter.")
#         return False

#     stored_encodings = np.load(face_rec_file)

#     # LOGIN IMAGE from temp folder
#     temp_path = os.path.join("temp", f"{voter_id}.jpg")

#     if not os.path.exists(temp_path):
#         print("[ERROR] Login image not found.")
#         return False

#     # Load the uploaded login image
#     img = cv2.imread(temp_path)
#     rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

#     face_locations = face_recognition.face_locations(rgb)
#     face_encodings = face_recognition.face_encodings(rgb, face_locations)

#     if len(face_encodings) == 0:
#         print("[FAILED] No face found in login image.")
#         return False

#     login_face = face_encodings[0]

#     distances = face_recognition.face_distance(stored_encodings, login_face)
#     best = np.min(distances)

#     if best < tolerance:
#         print("SUCCESS", best)
#         return True
#     else:
#         print("FAILED", best)
#         return False


# if __name__ == "__main__":
#     voter_id = sys.argv[1]
#     if verify_voter(voter_id):
#         print("SUCCESS")
#     else:
#         print("FAILED")


# import cv2
# import face_recognition
# import numpy as np
# import os
# import sys

# def verify_voter(voter_id, tolerance=0):
#     encodings_dir = "encodings"
#     face_file = os.path.join(encodings_dir, f"{voter_id}_face_recognition.npy")

#     # Encoding file must exist
#     if not os.path.exists(face_file):
#         print("FAILED")
#         return False

#     stored = np.load(face_file)

#     # Fix shape if needed
#     if len(stored.shape) == 1:
#         stored = [stored]

#     # Load uploaded frame
#     img_path = os.path.join("temp", f"{voter_id}.jpg")

#     if not os.path.exists(img_path):
#         print("FAILED")
#         return False

#     img = cv2.imread(img_path)
#     if img is None:
#         print("FAILED")
#         return False

#     # Convert BGR → RGB
#     rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

#     # Detect face
#     face_locations = face_recognition.face_locations(rgb, model="hog")  # fastest
#     face_encodings = face_recognition.face_encodings(rgb, face_locations)

#     if len(face_encodings) == 0:
#         print("FAILED")
#         return False

#     face = face_encodings[0]

#     # Compare faces
#     matches = face_recognition.compare_faces(stored, face, tolerance)
#     distances = face_recognition.face_distance(stored, face)

#     best = np.argmin(distances)

#     if matches[best]:
#         print("SUCCESS")
#         return True

#     print("FAILED")
#     return False


# if __name__ == "__main__":
#     voter_id = sys.argv[1]
#     verify_voter(voter_id)

import cv2
import face_recognition
import numpy as np
import os
import sys

def verify_voter(voter_id, tolerance=0.5):
    encodings_dir = "encodings"
    temp_dir = "temp"

    face_rec_file = os.path.join(encodings_dir, f"{voter_id}_face_recognition.npy")
    temp_image_file = os.path.join(temp_dir, f"{voter_id}.jpg")

    print("DEBUG | Looking for encoding:", face_rec_file)
    print("DEBUG | Looking for login image:", temp_image_file)

    # 1. Check encoding file
    if not os.path.exists(face_rec_file):
        print("FAILED | Encoding file NOT FOUND")
        return False

    stored_encodings = np.load(face_rec_file)
    print("DEBUG | Encoding loaded. Shape:", stored_encodings.shape)

    # 2. Check login image
    if not os.path.exists(temp_image_file):
        print("FAILED | Login image NOT FOUND")
        return False

    img = cv2.imread(temp_image_file)
    if img is None:
        print("FAILED | Login image unreadable")
        return False

    rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

    # 3. Detect face
    face_encodings = face_recognition.face_encodings(rgb)

    if len(face_encodings) == 0:
        print("FAILED | No face detected in login image")
        return False

    login_face = face_encodings[0]

    # 4. Compare
    distances = face_recognition.face_distance(stored_encodings, login_face)
    best = np.min(distances)

    print("DEBUG | Best distance:", best)

    if best < tolerance:
        print("SUCCESS")
        sys.exit(0)
        return True

    print("FAILED | Distance >= tolerance")
    return False


if __name__ == "__main__":
    voter_id = sys.argv[1]
    verify_voter(voter_id)
