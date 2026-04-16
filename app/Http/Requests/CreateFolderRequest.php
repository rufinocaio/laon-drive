<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateFolderRequest extends FormRequest
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
            'name' => ['required', 'string', 'max:255'],
            'parent_id' => ['nullable', 'string', 'exists:files,id'],
        ];
    }

    /**
     * Obtém as mensagens customizadas para erros de validação.
     */
    public function messages(): array
    {
        return [
            'name.required' => 'O nome da pasta é obrigatório.',
            'name.max' => 'O nome da pasta deve ter no máximo 255 caracteres.',
        ];
    }
}
