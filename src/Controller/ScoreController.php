<?php

/**
 * Created by PhpStorm.
 * User: aurelwcs
 * Date: 08/04/19
 * Time: 18:40
 */

namespace App\Controller;

use App\Model\SoloscoreManager;

class ScoreController extends AbstractController
{
    public function index()
    {
        $soloscoreManager = new SoloscoreManager();
        $games = $soloscoreManager->gamesWithScore();
        $scores = [];
        foreach ($games as $game) {
            $scores[intval($game['game_id'])] = $soloscoreManager->topScore(intval($game['game_id']));
        }
        return $this->twig->render('Score/index.html.twig', [
            'scores' => $scores
        ]);
    }

    public function show(int $id)
    {
        $soloscoreManager = new SoloscoreManager();
        $scores = $soloscoreManager->topScore($id);
        return $this->twig->render('Score/show.html.twig', [
            'scores' => $scores
        ]);
    }
}
