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
use App\Model\UserManager;
use App\Service\NasaService;

class HomeController extends AbstractController
{
    /**
     * Display home page
     *
     * @return string
     * @throws \Twig\Error\LoaderError
     * @throws \Twig\Error\RuntimeError
     * @throws \Twig\Error\SyntaxError
     */
    public function index()
    {
        $gamesManager = new GameManager();
        $games = $gamesManager->selectGameIndex();
        return $this->twig->render('Home/index.html.twig', [
            'games' => $games
        ]);
    }

    public function game()
    {
        $gamesManager = new GameManager();
        $games = $gamesManager->selectAll();
        return $this->twig->render('Home/game.html.twig', [
            'games' => $games
        ]);
    }

    public function score()
    {
        $gameManager = new GameManager();
        $games = $gameManager->selectAll();
        return $this->twig->render('Home/score.html.twig', [
            'games' => $games
        ]);
    }

    public function account()
    {
        if (!isset($_SESSION['user'])) {
            header('Location: /');
        }
        $scoreManager = new SoloscoreManager();
        $preScores = $scoreManager->gamesWithScore(intval($_SESSION['user']['id']));
        $scores = [];
        foreach ($preScores as $preScore) {
            if (!isset($scores[intval($preScore['game_id'])])) {
                $scores[intval($preScore['game_id'])] = [
                    "score" => 0,
                    "name" => $preScore['name'],
                    "status" => $preScore['status'],
                    "image" => $preScore['image']
                ];
            }
            if (intval($preScore['score']) > $scores[intval($preScore['game_id'])]['score']) {
                $scores[intval($preScore['game_id'])]['score'] = intval($preScore['score']);
            }
        }
        return $this->twig->render('Home/compte.html.twig', [
            "scores" => $scores
        ]);
    }

    public function notFound()
    {
        return $this->twig->render('Home/notFound.html.twig');
    }
}
