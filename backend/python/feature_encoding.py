import cv2
import face_recognition
import os
import sys
import numpy as np
from sklearn.preprocessing import normalize

# -------------------------------------------------------------
# SIMPLE ROBUST FACE ENCODER (HOG + LBP Feature Vector)
# -------------------------------------------------------------
class RobustFaceEncoder:
    def extract_face_features(self, image):
        # Convert to grayscale
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

        # Resize to standard size
        resized = cv2.resize(gray, (128, 128))

        return self._combine_features(resized)

    def _combine_features(self, gray):
        features = []

        # HOG-like gradients
        gx = cv2.Sobel(gray, cv2.CV_64F, 1, 0, ksize=3)
        gy = cv2.Sobel(gray, cv2.CV_64F, 0, 1, ksize=3)
        magnitude = np.sqrt(gx**2 + gy**2)
        angle = np.arctan2(gy, gx)

        cell_size = 16
        for i in range(0, gray.shape[0], cell_size):
            for j in range(0, gray.shape[1], cell_size):
                mag_cell = magnitude[i:i+cell_size, j:j+cell_size]
                ang_cell = angle[i:i+cell_size, j:j+cell_size]
                hist, _ = np.histogram(
                    ang_cell,
                    bins=9,
                    range=(-np.pi, np.pi),
                    weights=mag_cell
                )
                features.extend(hist)

        # LBP
        lbp_vals = []
        for i in range(1, gray.shape[0]-1, 8):
            for j in range(1, gray.shape[1]-1, 8):
                center = gray[i, j]
                neighbors = [
                    gray[i-1, j-1], gray[i-1, j], gray[i-1, j+1],
                    gray[i, j+1], gray[i+1, j+1], gray[i+1, j],
                    gray[i+1, j-1], gray[i, j-1]
                ]
                val = 0
                for idx, n in enumerate(neighbors):
                    if n >= center:
                        val |= (1 << idx)
                lbp_vals.append(val)

        lbp_hist, _ = np.histogram(lbp_vals, bins=256, range=(0, 256))
        features.extend(lbp_hist.tolist())

        # Stats
        features.extend([
            np.mean(gray),
            np.std(gray),
            np.median(gray),
            np.var(gray),
        ])

        return np.array(features, dtype=np.float32)


# -------------------------------------------------------------
# SAFE IMAGE LOAD
# -------------------------------------------------------------
def load_clean_image(img_path):
    img_bgr = cv2.imread(img_path)

    if img_bgr is None:
        return None, None

    img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
    return img_bgr, img_rgb.astype(np.uint8)


# -------------------------------------------------------------
# MAIN ENCODER
# -------------------------------------------------------------
def encode_faces(voter_id):
    dataset_path = os.path.join("dataset", voter_id)
    enc_path = "encodings"

    if not os.path.exists(dataset_path):
        print(f"❌ No dataset found for voter ID: {voter_id}")
        return

    os.makedirs(enc_path, exist_ok=True)

    robust_encoder = RobustFaceEncoder()
    fr_encodings = []
    robust_encodings = []

    print(f"[INFO] Encoding images for: {voter_id}")

    image_files = sorted([
        f for f in os.listdir(dataset_path)
        if f.lower().endswith((".jpg", ".jpeg", ".png"))
    ])

    if not image_files:
        print("❌ No images found.")
        return

    success_count = 0

    for file in image_files:
        path = os.path.join(dataset_path, file)
        print(f"\n--- Processing {file} ---")

        bgr, rgb = load_clean_image(path)
        if rgb is None:
            print(f"❌ Cannot load {file}")
            continue

        # Dlib / face_recognition encoding
        try:
            img_rgb = np.ascontiguousarray(rgb)

            boxes = face_recognition.face_locations(img_rgb, model="hog")

            if boxes:
                enc = face_recognition.face_encodings(img_rgb, boxes)
                if enc:
                    fr_encodings.append(enc[0])
                    print(f"✅ face_recognition encoded {file}")
                    success_count += 1
            else:
                print("⚠️ No face detected (face_recognition)")

        except Exception as e:
            print(f"⚠️ face_recognition error: {e}")

        # Robust encoder
        try:
            feat = robust_encoder.extract_face_features(bgr)
            if feat is not None:
                robust_encodings.append(normalize([feat])[0])
                print(f"✅ Robust encoder processed {file}")
            else:
                print("⚠️ Robust encoder found no face")
        except Exception as e:
            print(f"⚠️ Robust encoder error: {e}")

    saved = []

    if fr_encodings:
        np.save(f"{enc_path}/{voter_id}_face_recognition.npy", np.array(fr_encodings))
        saved.append(f"{voter_id}_face_recognition.npy")

    if robust_encodings:
        np.save(f"{enc_path}/{voter_id}_robust.npy", np.array(robust_encodings))
        saved.append(f"{voter_id}_robust.npy")

    print("\n=== SUMMARY ===")
    print(f"Images processed   : {len(image_files)}")
    print(f"Total success      : {success_count}")
    print(f"FR encodings       : {len(fr_encodings)}")
    print(f"Robust encodings   : {len(robust_encodings)}")
    print(f"Saved files        : {saved}")


if __name__ == "__main__":
    voter_id = sys.argv[1]
    encode_faces(voter_id)
