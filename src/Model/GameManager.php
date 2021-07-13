<?php

namespace App\Model;

use PDO;

class GameManager extends AbstractManager
{
    public const TABLE = 'game';

    /**
     *  Initializes this class.
     */
    public function __construct()
    {
        parent::__construct(self::TABLE);
    }

    public function selectGameIndex(): array
    {
        return $this->pdo->query('SELECT * FROM ' . self::TABLE . ' LIMIT 3')->fetchAll();
    }
}
