<?php

namespace App\Model;

use PDO;

class SoloscoreManager extends AbstractManager
{
    public const TABLE = 'soloscore';

    /**
     *  Initializes this class.
     */
    public function __construct()
    {
        parent::__construct(self::TABLE);
    }

    public function insert(array $score): int
    {
        $statement = $this->pdo->prepare(
            'INSERT INTO ' . self::TABLE . ' (game_id, user_id, score) 
            VALUES (:game_id, :user_id, :score);'
        );
        $statement->bindValue('game_id', $score['game_id'], PDO::PARAM_INT);
        $statement->bindValue('user_id', $score['user_id'], PDO::PARAM_INT);
        $statement->bindValue('score', $score['score'], PDO::PARAM_INT);
        $statement->execute();

        return (int) $this->pdo->lastInsertId();
    }

    public function topScore(int $id)
    {
        $statement = $this->pdo->prepare(
            'SELECT soloscore.game_id, game.name game_name, user.username, 
            soloscore.score, game.facts game_facts 
            FROM ' . self::TABLE . ' 
            JOIN game ON game.id = soloscore.game_id 
            JOIN user ON user.id = soloscore.user_id 
            WHERE soloscore.game_id = :id 
            ORDER BY soloscore.score DESC;'
        );
        $statement->bindValue('id', $id, PDO::PARAM_INT);
        $statement->execute();

        return $statement->fetchAll();
    }

    public function gamesWithScore(int $id = 0)
    {
        $query = 'SELECT soloscore.game_id, soloscore.user_id, soloscore.score, 
        game.name, game.status, game.image FROM ' . self::TABLE . ' 
        JOIN game ON game.id = soloscore.game_id';
        if ($id > 0) {
            $query .= ' WHERE user_id = ' . $id;
        }
        return $this->pdo->query($query . ';')->fetchAll();
    }
}
