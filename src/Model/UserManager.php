<?php

namespace App\Model;

use PDO;
use DateTime;
use Doctrine\DBAL\Driver\SQLSrv\LastInsertId;

class UserManager extends AbstractManager
{
    public const TABLE = 'user';

    /**
     *  Initializes this class.
     */
    public function __construct()
    {
        parent::__construct(self::TABLE);
    }

    public function insert(array $user): int
    {
        $statement = $this->pdo->prepare(
            'INSERT INTO ' . self::TABLE . ' (username, password, created_at) VALUES 
            (:username, :password, :created_at);'
        );
        $dateOfInsert = date_format(new DateTime(), 'Y-m-d');
        $statement->bindValue('username', $user['username'], PDO::PARAM_STR);
        $statement->bindValue('password', $user['password'], PDO::PARAM_STR);
        $statement->bindValue('created_at', $dateOfInsert);
        $statement->execute();

        return (int) $this->pdo->lastInsertId();
    }

    public function selectOneByUsername(string $username)
    {
        $statement = $this->pdo->prepare(
            'SELECT * FROM ' . self::TABLE . ' WHERE 
            username = :username'
        );
        $statement->bindValue('username', $username, PDO::PARAM_STR);
        $statement->execute();

        return $statement->fetchAll();
    }
}
