<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UploadFileRequest extends FormRequest
{
    /**
     * Determina se o usuário está autorizado a fazer essa requisição.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Obtém as regras de validação aplicadas à requisição.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'files' => ['required', 'array', 'min:1'],
            'files.*' => ['required', 'file', 'max:102400'], // máximo de 100MB por arquivo
            'parent_id' => ['nullable', 'string', 'exists:files,id'],
        ];
    }

    /**
     * Obtém as mensagens customizadas para erros de validação.
     */
    public function messages(): array
    {
        return [
            'files.required' => 'Selecione pelo menos um arquivo para upload.',
            'files.*.max' => 'Cada arquivo deve ter no máximo 100MB.',
            'files.*.file' => 'O item enviado precisa ser um arquivo válido.',
        ];
    }
}
