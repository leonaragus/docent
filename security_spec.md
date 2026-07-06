# Security Specification - EduCapture Pro

## 1. Data Invariants

1. **Private Recordings Identity Lock**: A recording `/users/{userId}/recordings/{recordingId}` can only be read, created, updated, or deleted by the authenticated user matching `userId`.
2. **Recording Payload Validation**:
   - `id`, `name`, `size`, `date`, `url`, and `userId` are strictly required.
   - `userId` must match the authenticated user's UID.
   - `createdAt` is immutable once set and must match `request.time`.
   - `size`, `name`, `url` must conform to strict type (string) and size constraints to prevent Denial of Wallet.
3. **Public Shared Classes Accessibility**:
   - Anyone (including unauthenticated students) can read (get) a shared class `/sharedClasses/{classId}`.
   - However, listing or querying all shared classes is forbidden to prevent scraping.
   - Only authenticated users can create or update a `/sharedClasses/{classId}`.
   - `userId` must match the authenticated teacher's UID.
   - No one can delete or modify a shared class unless they are the owner (teacher who created it).

---

## 2. The "Dirty Dozen" Malicious Payloads

Here are 12 malicious payloads designed to test rules and ensure they return `PERMISSION_DENIED`:

### Payload 1: Identity Spoofing (Create recording for someone else)
- **Target Path**: `/users/user_A/recordings/rec_123`
- **Auth User**: `user_B`
- **Payload**:
  ```json
  {
    "id": "rec_123",
    "name": "Clase_Spoof.mp4",
    "size": "15.4",
    "date": "2026-06-27",
    "url": "https://drive.google.com/...",
    "userId": "user_A"
  }
  ```

### Payload 2: Read Theft (Access someone else's recording)
- **Target Path**: `/users/user_A/recordings/rec_123`
- **Auth User**: `user_B`
- **Operation**: `get`

### Payload 3: Shadow Update (Inject extra ghost fields)
- **Target Path**: `/users/user_A/recordings/rec_123`
- **Auth User**: `user_A`
- **Payload**:
  ```json
  {
    "id": "rec_123",
    "name": "Clase_Valid.mp4",
    "size": "15.4",
    "date": "2026-06-27",
    "url": "https://drive.google.com/...",
    "userId": "user_A",
    "isPremiumAdmin": true,
    "systemOverridden": true
  }
  ```

### Payload 4: ID Poisoning (Extremely long path variable ID)
- **Target Path**: `/users/user_A/recordings/very_long_id_exceeding_128_chars_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
- **Auth User**: `user_A`
- **Payload**:
  ```json
  {
    "id": "very_long_id_exceeding_128_chars_...",
    "name": "Class.mp4",
    "size": "5.0",
    "date": "2026-06-27",
    "url": "https://drive.google.com/...",
    "userId": "user_A"
  }
  ```

### Payload 5: Type Poisoning (Boolean size value instead of string)
- **Target Path**: `/users/user_A/recordings/rec_123`
- **Auth User**: `user_A`
- **Payload**:
  ```json
  {
    "id": "rec_123",
    "name": "Clase.mp4",
    "size": true,
    "date": "2026-06-27",
    "url": "https://drive.google.com/...",
    "userId": "user_A"
  }
  ```

### Payload 6: Unauthenticated Creation (Create recording without login)
- **Target Path**: `/users/user_A/recordings/rec_123`
- **Auth User**: `null` (Anonymous/Not Logged In)
- **Payload**:
  ```json
  {
    "id": "rec_123",
    "name": "Clase.mp4",
    "size": "2.4",
    "date": "2026-06-27",
    "url": "https://drive.google.com/...",
    "userId": "user_A"
  }
  ```

### Payload 7: Immortal Field Alteration (Overwrite owner userId during update)
- **Target Path**: `/users/user_A/recordings/rec_123`
- **Auth User**: `user_A`
- **Existing**: `userId: user_A`
- **Update Payload**:
  ```json
  {
    "userId": "user_B"
  }
  ```

### Payload 8: Shared Class Identity Theft (Create a shared class with another user's ID)
- **Target Path**: `/sharedClasses/class_789`
- **Auth User**: `user_A`
- **Payload**:
  ```json
  {
    "id": "class_789",
    "name": "Clase_Spoof_Teacher",
    "url": "https://drive.google.com/...",
    "teacherName": "Profa. Pía Morales",
    "subjectName": "Ciencias",
    "date": "2026-06-27",
    "userId": "user_B"
  }
  ```

### Payload 9: Shared Class Modification by Non-Owner
- **Target Path**: `/sharedClasses/class_789`
- **Auth User**: `user_B`
- **Existing**: `userId: user_A`
- **Operation**: `update`

### Payload 10: Insecure Bulk Scraping (Scraping all shared classes)
- **Target Path**: `/sharedClasses`
- **Auth User**: `null`
- **Operation**: `list` (should be forbidden without specific filters/document fetch)

### Payload 11: Non-verified Email Creation (Attempt to write with unverified email token)
- **Target Path**: `/users/user_A/recordings/rec_123`
- **Auth User**: `user_A` (email_verified = false)
- **Payload**:
  ```json
  {
    "id": "rec_123",
    "name": "Clase_Unverified.mp4",
    "size": "10.0",
    "date": "2026-06-27",
    "url": "https://drive.google.com/...",
    "userId": "user_A"
  }
  ```

### Payload 12: Timestamp Spoofing (Forcing client time into createdAt)
- **Target Path**: `/users/user_A/recordings/rec_123`
- **Auth User**: `user_A`
- **Payload**:
  ```json
  {
    "id": "rec_123",
    "name": "Clase.mp4",
    "size": "10.0",
    "date": "2026-06-27",
    "url": "https://drive.google.com/...",
    "userId": "user_A",
    "createdAt": "2010-01-01T00:00:00Z"
  }
  ```

---

## 3. The Test Runner Reference

These conditions are mathematically enforced inside our `firestore.rules` configuration.
