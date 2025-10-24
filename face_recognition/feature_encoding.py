import cv2
import face_recognition
import os
import sys
import numpy as np
from PIL import Image
from sklearn.preprocessing import normalize
import mediapipe as mp

class RobustFaceEncoder:
    def __init__(self):
        try:
            self.mp_face_detection = mp.solutions.face_detection
            self.face_detection = self.mp_face_detection.FaceDetection(
                model_selection=0, min_detection_confidence=0.5
            )
            self.mediapipe_available = True
        except:
            self.mediapipe_available = False
            print("⚠️ MediaPipe not available - install with: pip install mediapipe scikit-learn")

    def extract_face_features(self, image):
        """Extract face features using MediaPipe"""
        if not self.mediapipe_available:
            return None
            
        rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        results = self.face_detection.process(rgb_image)
        
        if not results.detections:
            return None
        
        # Get face region
        detection = results.detections[0]
        bbox = detection.location_data.relative_bounding_box
        h, w, _ = image.shape
        
        # Extract face region
        x = int(bbox.xmin * w)
        y = int(bbox.ymin * h)
        width = int(bbox.width * w)
        height = int(bbox.height * h)
        
        # Add padding and ensure bounds
        padding = 20
        x = max(0, x - padding)
        y = max(0, y - padding)
        width = min(w - x, width + 2 * padding)
        height = min(h - y, height + 2 * padding)
        
        face_region = image[y:y + height, x:x + width]
        
        if face_region.size == 0:
            return None
        
        # Resize to standard size and create feature vector
        face_resized = cv2.resize(face_region, (128, 128))
        face_gray = cv2.cvtColor(face_resized, cv2.COLOR_BGR2GRAY)
        
        # Create feature vector using multiple methods
        features = self._extract_combined_features(face_gray)
        return features

    def _extract_combined_features(self, face_gray):
        """Extract combined features from face"""
        features = []
        
        # 1. HOG-like features
        grad_x = cv2.Sobel(face_gray, cv2.CV_64F, 1, 0, ksize=3)
        grad_y = cv2.Sobel(face_gray, cv2.CV_64F, 0, 1, ksize=3)
        magnitude = np.sqrt(grad_x**2 + grad_y**2)
        angle = np.arctan2(grad_y, grad_x)
        
        # Compute histogram of gradients
        cell_size = 16
        for i in range(0, face_gray.shape[0], cell_size):
            for j in range(0, face_gray.shape[1], cell_size):
                cell_mag = magnitude[i:i+cell_size, j:j+cell_size]
                cell_angle = angle[i:i+cell_size, j:j+cell_size]
                
                hist, _ = np.histogram(cell_angle, bins=9, range=(-np.pi, np.pi), 
                                     weights=cell_mag)
                features.extend(hist)
        
        # 2. LBP-like features (Local Binary Patterns)
        lbp_features = self._extract_lbp_features(face_gray)
        features.extend(lbp_features)
        
        # 3. Statistical features
        features.extend([
            np.mean(face_gray), np.std(face_gray),
            np.median(face_gray), np.var(face_gray)
        ])
        
        return np.array(features, dtype=np.float32)

    def _extract_lbp_features(self, face_gray):
        """Extract Local Binary Pattern features"""
        lbp_features = []
        
        # Simple LBP implementation
        for i in range(1, face_gray.shape[0] - 1, 8):
            for j in range(1, face_gray.shape[1] - 1, 8):
                center = face_gray[i, j]
                binary_pattern = 0
                
                # 8-neighborhood
                neighbors = [
                    face_gray[i-1, j-1], face_gray[i-1, j], face_gray[i-1, j+1],
                    face_gray[i, j+1], face_gray[i+1, j+1], face_gray[i+1, j],
                    face_gray[i+1, j-1], face_gray[i, j-1]
                ]
                
                for idx, neighbor in enumerate(neighbors):
                    if neighbor >= center:
                        binary_pattern |= (1 << idx)
                
                lbp_features.append(binary_pattern)
        
        # Create histogram of LBP values
        hist, _ = np.histogram(lbp_features, bins=256, range=(0, 256))
        return hist.tolist()

def diagnose_image(img_path):
    """Diagnose image properties"""
    print(f"\n=== Diagnosing {os.path.basename(img_path)} ===")
    
    # Check with OpenCV
    img_cv = cv2.imread(img_path)
    if img_cv is not None:
        print(f"OpenCV - Shape: {img_cv.shape}, dtype: {img_cv.dtype}")
        print(f"OpenCV - Min: {img_cv.min()}, Max: {img_cv.max()}")
    else:
        print("OpenCV - Failed to read")
    
    # Check with PIL
    try:
        pil_img = Image.open(img_path)
        print(f"PIL - Mode: {pil_img.mode}, Size: {pil_img.size}")
        pil_array = np.array(pil_img)
        print(f"PIL Array - Shape: {pil_array.shape}, dtype: {pil_array.dtype}")
    except Exception as e:
        print(f"PIL - Error: {e}")
    
    # Check file properties
    file_size = os.path.getsize(img_path)
    print(f"File size: {file_size} bytes")

def encode_faces(voter_id):
    """
    Processes a dataset of images for a given voter ID using multiple methods.
    
    Args:
        voter_id (str): The unique identifier for the voter.
    """
    dataset_path = os.path.join("dataset", voter_id)
    encodings_dir = "encodings"
    face_recognition_encodings = []
    robust_encodings = []
    
    if not os.path.exists(dataset_path):
        print(f"❌ No dataset found for voter ID {voter_id}")
        return
    
    # Create the encodings directory if it doesn't exist
    os.makedirs(encodings_dir, exist_ok=True)
    
    # Initialize robust encoder
    robust_encoder = RobustFaceEncoder()
    
    print(f"[INFO] Encoding faces for Voter ID: {voter_id}")
    
    # Get list of image files
    image_files = [f for f in os.listdir(dataset_path) 
                  if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
    
    if not image_files:
        print("❌ No image files found in dataset")
        return
    
    # Diagnose first image
    first_img_path = os.path.join(dataset_path, image_files[0])
    diagnose_image(first_img_path)
    
    success_count = 0
    
    for file in sorted(image_files):
        img_path = os.path.join(dataset_path, file)
        print(f"\n--- Processing {file} ---")
        
        # Method 1: Try face_recognition library
        face_rec_success = False
        try:
            # Try PIL first
            pil_image = Image.open(img_path).convert('RGB')
            img_rgb = np.array(pil_image)
            
            # Ensure proper format
            if img_rgb.dtype != np.uint8:
                img_rgb = img_rgb.astype(np.uint8)
            
            if len(img_rgb.shape) == 3 and img_rgb.shape[2] == 3:
                boxes = face_recognition.face_locations(img_rgb, model="hog")
                
                if boxes:
                    faces = face_recognition.face_encodings(img_rgb, boxes)
                    if faces:
                        face_recognition_encodings.append(faces[0])
                        print(f"✅ Face_recognition encoded {file}")
                        face_rec_success = True
                    
        except Exception as e:
            print(f"⚠️ Face_recognition failed for {file}: {e}")
            
            # Fallback: Try OpenCV reading
            try:
                img = cv2.imread(img_path, cv2.IMREAD_COLOR)
                if img is not None:
                    if img.dtype != np.uint8:
                        img = img.astype(np.uint8)
                    
                    img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
                    boxes = face_recognition.face_locations(img_rgb, model="hog")
                    
                    if boxes:
                        faces = face_recognition.face_encodings(img_rgb, boxes)
                        if faces:
                            face_recognition_encodings.append(faces[0])
                            print(f"✅ Face_recognition encoded {file} (OpenCV fallback)")
                            face_rec_success = True
                        
            except Exception as fallback_error:
                print(f"⚠️ Face_recognition OpenCV fallback failed: {fallback_error}")
        
        # Method 2: Try robust encoding
        robust_success = False
        try:
            img = cv2.imread(img_path)
            if img is not None:
                features = robust_encoder.extract_face_features(img)
                if features is not None:
                    # Normalize features
                    features = normalize([features])[0]
                    robust_encodings.append(features)
                    print(f"✅ Robust encoder processed {file}")
                    robust_success = True
                else:
                    print(f"⚠️ Robust encoder found no face in {file}")
            else:
                print(f"❌ Could not read {file} with OpenCV")
                
        except Exception as e:
            print(f"⚠️ Robust encoding failed for {file}: {e}")
        
        if face_rec_success or robust_success:
            success_count += 1
    
    # Save encodings
    saved_files = []
    
    if face_recognition_encodings:
        face_rec_array = np.array(face_recognition_encodings)
        np.save(f"{encodings_dir}/{voter_id}_face_recognition.npy", face_rec_array)
        print(f"\n✅ Saved {len(face_recognition_encodings)} face_recognition encodings")
        saved_files.append(f"{voter_id}_face_recognition.npy")
    
    if robust_encodings:
        robust_array = np.array(robust_encodings)
        np.save(f"{encodings_dir}/{voter_id}_robust.npy", robust_array)
        print(f"✅ Saved {len(robust_encodings)} robust encodings")
        saved_files.append(f"{voter_id}_robust.npy")
    
    # Summary
    print(f"\n=== SUMMARY ===")
    print(f"Total images processed: {len(image_files)}")
    print(f"Successfully encoded: {success_count}")
    print(f"Face_recognition encodings: {len(face_recognition_encodings)}")
    print(f"Robust encodings: {len(robust_encodings)}")
    print(f"Files saved: {saved_files}")
    
    if not saved_files:
        print("⚠️ No encodings generated. Consider:")
        print("  1. Check if images contain clear faces")
        print("  2. Improve lighting during capture")
        print("  3. Ensure faces are well-centered")
        print("  4. Install MediaPipe: pip install mediapipe scikit-learn")

if __name__ == "__main__":
    voter_id = sys.argv[1]
    encode_faces(voter_id)
