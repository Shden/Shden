<?php

/*
 * Stuff to work with .ini files in php
 */
$controller_ini = "/home/den/shc/controller.ini";

function write_ini_file($file, array $options){
    $tmp = '';
    foreach($options as $section => $values){
        $tmp .= "[$section]\n";
        foreach($values as $key => $val){
            if(is_array($val)){
                foreach($val as $k =>$v){
                    $tmp .= "{$key}[$k] = \"$v\"\n";
                }
            }
            else
                $tmp .= "$key = \"$val\"\n";
        }
        $tmp .= "\n";
    }
    file_put_contents($file, $tmp);
    unset($tmp);
}
?>
