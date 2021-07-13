<?php

/**
 * Created by PhpStorm.
 * User: aurelwcs
 * Date: 08/04/19
 * Time: 18:40
 */

namespace App\Controller;

use App\Model\GameManager;
use App\Model\SoloscoreManager;

class GameController extends AbstractController
{
    /**
     * Display home page
     *
     * @return string
     * @throws \Twig\Error\LoaderError
     * @throws \Twig\Error\RuntimeError
     * @throws \Twig\Error\SyntaxError
     */
    public function index(int $id)
    {
        $gameManager = new GameManager();
        $game = $gameManager->selectOneById($id);
        return $this->twig->render('Game/index.html.twig', [
            'game' => $game
        ]);
    }

    public function savescore()
    {
        $result = [];
        $soloscoreManager = new SoloscoreManager();
        $score = [
            "game_id" => intval($_POST['game']),
            "user_id" => intval($_SESSION['user']['id']),
            "score" => intval($_POST['score'])
        ];
        $result['id'] = $soloscoreManager->insert($score);
        if (!isset($result['id'])) {
            $result['error'] = "Erreur de l'enregistrement du score";
        }
        if (!isset($result['error'])) {
            return json_encode($result);
        }
    }
}
