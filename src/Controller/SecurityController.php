<?php

namespace App\Controller;

use App\Model\UserManager;

class SecurityController extends AbstractController
{
    public function register()
    {
        $userManager = new UserManager();
        $error = [];
        if ($_SERVER['REQUEST_METHOD'] === "POST") {
            $error = [];
            if (
                isset($_POST['username']) &&
                isset($_POST['password']) &&
                isset($_POST['passwordVerif']) &&
                !empty($_POST['username']) &&
                !empty($_POST['password']) &&
                !empty($_POST['passwordVerif'])
            ) {
                $tmpUser = [
                    'username' => trim(htmlspecialchars($_POST['username'])),
                    'password' => md5($_POST['password']),
                    'passwordVerif' => md5($_POST['passwordVerif'])
                ];

                $otherUser = $userManager->selectOneByUsername($tmpUser['username']);
                if (!empty($otherUser)) {
                    $error['username'] = "Ce nom d'utilisateur est déjà pris";
                }

                if ($tmpUser['password'] != $tmpUser['passwordVerif']) {
                    $error['password'] = "Les mots de passe ne correspondent pas";
                }
                if (empty($error)) {
                    $user = [
                        'username' => $tmpUser['username'],
                        'password' => $tmpUser['password']
                    ];
                    $userManager->insert($user);
                    $_SESSION['user'] = $userManager->selectOneByUsername($user['username'])[0];
                    header('Location: /Home/index');
                }
            } else {
                $error['fields'] = "All fields are required";
            }
        }

        return $this->twig->render('Security/register.html.twig', [
            'error' => $error
        ]);
    }

    public function login()
    {
        $userManager = new UserManager();
        $error = [];
        if ($_SERVER['REQUEST_METHOD'] === "POST") {
            if (
                isset($_POST['username']) &&
                isset($_POST['password']) &&
                !empty($_POST['username']) &&
                !empty($_POST['password'])
            ) {
                $tmpUser = $userManager->selectOneByUsername($_POST['username']);
                if (!$tmpUser) {
                    $error['username'] = "Utilisateur introuvable";
                } else {
                    if (md5($_POST['password']) != $tmpUser[0]['password']) {
                        $error['password'] = "Mot de passe incorrect";
                    }
                }
                if (empty($error)) {
                    $_SESSION['user'] = $tmpUser[0];
                    header('Location: /Home/index');
                }
            } else {
                $error['fields'] = "Tous les champs sont requis";
            }
        }
        return $this->twig->render('Security/login.html.twig', [
            'error' => $error
        ]);
    }
    public function logout()
    {
        session_unset();
        session_destroy();
        header('Location: /Home/index');
    }
}
