<?php
final class LecturerController
{
    private const MAX_IMAGE_LENGTH = 3_500_000;

    public function __construct(private Lecturer $lecturers) {}

    public function index(): void
    {
        $id = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT);
        if ($id !== null && $id !== false) {
            $lecturer = $this->lecturers->find($id);
            if (!$lecturer) {
                jsonResponse(404, ['success' => false, 'message' => 'Lecturer not found']);
            }
            jsonResponse(200, ['success' => true, 'data' => $lecturer]);
        }

        $keyword = trim((string) ($_GET['keyword'] ?? ''));
        jsonResponse(200, ['success' => true, 'data' => $this->lecturers->all($keyword)]);
    }

    public function store(): void
    {
        $data = $this->validate(getJsonBody());
        $id = $this->lecturers->create($data);
        jsonResponse(201, [
            'success' => true,
            'message' => 'Lecturer added successfully',
            'data' => $this->lecturers->find($id),
        ]);
    }

    public function update(): void
    {
        $id = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT);
        if (!$id || !$this->lecturers->find($id)) {
            jsonResponse(404, ['success' => false, 'message' => 'Lecturer not found']);
        }

        $data = $this->validate(getJsonBody());
        $this->lecturers->update($id, $data);
        jsonResponse(200, [
            'success' => true,
            'message' => 'Lecturer updated successfully',
            'data' => $this->lecturers->find($id),
        ]);
    }

    public function destroy(): void
    {
        $id = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT);
        if (!$id || !$this->lecturers->delete($id)) {
            jsonResponse(404, ['success' => false, 'message' => 'Lecturer not found']);
        }
        jsonResponse(200, ['success' => true, 'message' => 'Lecturer deleted successfully']);
    }

    private function validate(array $input): array
    {
        $fullname = trim((string) ($input['Fullname'] ?? ''));
        $sumClass = $input['SumClass'] ?? null;
        $image = trim((string) ($input['Image'] ?? ''));

        if ($fullname === '') {
            jsonResponse(422, ['success' => false, 'message' => 'Full name is required']);
        }
        if (mb_strlen($fullname) > 150) {
            jsonResponse(422, ['success' => false, 'message' => 'Full name must not exceed 150 characters']);
        }

        $sumClassValue = filter_var($sumClass, FILTER_VALIDATE_INT);
        if ($sumClassValue === false || $sumClassValue < 0) {
            jsonResponse(422, ['success' => false, 'message' => 'Total classes must be a non-negative integer']);
        }

        if (strlen($image) > self::MAX_IMAGE_LENGTH) {
            jsonResponse(422, ['success' => false, 'message' => 'The image is too large']);
        }
        if ($image !== '' && !$this->isValidImage($image)) {
            jsonResponse(422, ['success' => false, 'message' => 'The image must be a valid URL or JPG, PNG, WEBP, or GIF file']);
        }

        return [
            'Fullname' => $fullname,
            'Image' => $image !== '' ? $image : null,
            'SumClass' => $sumClassValue,
        ];
    }

    private function isValidImage(string $image): bool
    {
        if (filter_var($image, FILTER_VALIDATE_URL)) {
            return in_array(strtolower((string) parse_url($image, PHP_URL_SCHEME)), ['http', 'https'], true);
        }

        return preg_match(
            '/^data:image\/(?:jpeg|png|webp|gif);base64,[a-zA-Z0-9+\/=\r\n]+$/',
            $image
        ) === 1;
    }
}
