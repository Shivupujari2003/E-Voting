import cv2
import os
import sys
import numpy as np

DATASET_DIR = "dataset"

def collect_images(voter_id, num_samples=20):
    """
    Collects a specified number of images for a given voter ID using the webcam.
    
    Args:
        voter_id (str): The unique identifier for the voter.
        num_samples (int): The target number of images to capture.
    """
    voter_dir = os.path.join(DATASET_DIR, voter_id)
    os.makedirs(voter_dir, exist_ok=True)

    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("❌ Error: Could not open webcam.")
        return
        
    count = 0

    print(f"[INFO] Collecting images for Voter ID: {voter_id}")
    print(f"Press 'c' to capture an image, 'q' to quit. Target: {num_samples} images.")

    cv2.namedWindow("Capture - Press 'c' to Capture, 'q' to Quit", cv2.WINDOW_NORMAL)
    cv2.resizeWindow("Capture - Press 'c' to Capture, 'q' to Quit", 640, 480)

    while True:
        ret, frame = cap.read()
        if not ret:
            print("❌ Failed to read from webcam")
            break

        # Show capture progress on the screen
        cv2.putText(frame, f"Captured: {count}/{num_samples}", (10, 30),
                    cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)

        cv2.imshow("Capture - Press 'c' to Capture, 'q' to Quit", frame)
        key = cv2.waitKey(50) & 0xFF

        if key == ord("c") and count < num_samples:
            img_path = os.path.join(voter_dir, f"{count}.jpg")
            
            # Ensure proper 8-bit format before saving
            if frame.dtype != np.uint8:
                frame = frame.astype(np.uint8)
            
            # Save directly in BGR format (OpenCV's native format)
            success = cv2.imwrite(img_path, frame, [cv2.IMWRITE_JPEG_QUALITY, 95])
            
            if success:
                count += 1
                print(f"[INFO] Captured image {count}/{num_samples}")
            else:
                print(f"❌ Failed to save image {count}")

        elif key == ord("q"):
            print("[INFO] Capture aborted by user.")
            break

        if count >= num_samples:
            print("[INFO] Target number of images reached.")
            break

    cap.release()
    cv2.destroyAllWindows()
    print(f"[INFO] Finished collecting {count} images for {voter_id}")

if __name__ == "__main__":
    voter_id = sys.argv[1] 
    collect_images(voter_id)


