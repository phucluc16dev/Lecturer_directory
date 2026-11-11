<?php
final class Lecturer
{
    public function __construct(private PDO $db) {}

    public function all(string $keyword = ''): array
    {
        if ($keyword !== '') {
            $stmt = $this->db->prepare(
                'SELECT IDGV, Fullname, Image, SumClass
                 FROM GiangVien
                 WHERE Fullname LIKE :keyword
                 ORDER BY IDGV DESC'
            );
            $stmt->execute(['keyword' => '%' . $keyword . '%']);
            return $stmt->fetchAll();
        }

        return $this->db
            ->query('SELECT IDGV, Fullname, Image, SumClass FROM GiangVien ORDER BY IDGV DESC')
            ->fetchAll();
    }

    public function find(int $id): array|false
    {
        $stmt = $this->db->prepare(
            'SELECT IDGV, Fullname, Image, SumClass FROM GiangVien WHERE IDGV = :id'
        );
        $stmt->execute(['id' => $id]);
        return $stmt->fetch();
    }

    public function create(array $data): int
    {
        $stmt = $this->db->prepare(
            'INSERT INTO GiangVien (Fullname, Image, SumClass)
             VALUES (:Fullname, :Image, :SumClass)'
        );
        $stmt->execute($data);
        return (int) $this->db->lastInsertId();
    }

    public function update(int $id, array $data): void
    {
        $data['IDGV'] = $id;
        $stmt = $this->db->prepare(
            'UPDATE GiangVien
             SET Fullname = :Fullname, Image = :Image, SumClass = :SumClass
             WHERE IDGV = :IDGV'
        );
        $stmt->execute($data);
    }

    public function delete(int $id): bool
    {
        $stmt = $this->db->prepare('DELETE FROM GiangVien WHERE IDGV = :id');
        $stmt->execute(['id' => $id]);
        return $stmt->rowCount() > 0;
    }
}

