# Guia de Uso: Sistema de Captura Automática de Áudio

## Visão Geral

O sistema foi atualizado para capturar e processar áudio automaticamente a cada 20 segundos, gerando dicas contínuas durante reuniões sem necessidade de intervenção manual.

## Como Funciona

### Comportamento Anterior

- Usuário clicava para iniciar gravação
- Gravava até o usuário clicar para parar
- Processava todo o áudio de uma vez

### Novo Comportamento

- Usuário clica uma vez para iniciar processamento automático
- Sistema grava continuamente e a cada 20 segundos:
  - Coleta áudio dos últimos 20 segundos
  - Transcreve áudio do usuário e do sistema
  - Gera dica baseada no contexto acumulado
  - Adiciona nova mensagem ao chat
- Continua até o usuário clicar para parar
- Gerencia memória automaticamente

## Interface do Usuário

### Estados Visuais

- **Parado**: Botão azul normal com ícone de microfone
- **Processando**: Animação pulsante vermelha/azul contínua
- **Contador**: Mostra tempo total da sessão e número de segmentos processados

### Controles

- **Primeiro clique**: Inicia processamento automático a cada 20s
- **Segundo clique**: Para processamento e finaliza sessão

### Informações Exibidas

- Tempo total da sessão
- Número de segmentos processados
- Monitor de memória (apenas em desenvolvimento)

## Configurações

Todas as configurações estão centralizadas em `src/renderer/src/config/audio-processing.ts`:

```typescript
export const AUDIO_PROCESSING_CONFIG = {
  SEGMENT_INTERVAL: 20000, // 20 segundos
  MAX_AUDIO_SEGMENTS: 50, // ~17min de histórico
  MAX_CONTEXT_MESSAGES: 100, // Limite para API
  CLEANUP_INTERVAL: 200000, // 200s entre limpezas
  MEMORY_WARNING_THRESHOLD: 40, // MB
  MIN_AUDIO_SIZE: 4900, // bytes mínimos
  COMPRESSION_THRESHOLD: 80 // Msgs antes de comprimir
}
```

## Gerenciamento de Memória

### Estratégias Implementadas

1. **Limpeza de Segmentos**: Mantém apenas os últimos 50 segmentos de áudio (~17 minutos)
2. **Compressão de Contexto**: Quando atinge 100 mensagens, comprime as antigas em um resumo
3. **Limpeza Periódica**: A cada 200 segundos, força garbage collection
4. **Alertas**: Avisa quando uso de memória excede 40MB

### Capacidade Suportada

- **Sessões curtas** (até 30 min): Funcionamento normal
- **Sessões médias** (30 min - 2h): Limpeza automática ativa
- **Memória máxima**: ~50MB de áudio + contexto comprimido

## Fluxo de Dados

```
Usuário clica → Inicia captura contínua → Timer 20s
    ↓
A cada 20s: Coleta áudio → Transcreve → Gera dica → Adiciona ao chat
    ↓
A cada 200s: Limpeza de memória → Compressão de contexto
    ↓
Usuário clica → Para tudo → Limpa recursos
```

## Tratamento de Erros

- **Falha na transcrição**: Continua processamento, loga erro
- **Falha na geração de dica**: Mantém contexto, tenta no próximo ciclo
- **Áudio insuficiente**: Pula segmento se menor que 1KB
- **Memória alta**: Força limpeza adicional

## Logs e Debug

### Logs Importantes

```
"Processamento automático iniciado"
"Segmento X processado com sucesso"
"Segmento muito pequeno, pulando..."
"Limpeza realizada. Segmentos: X, Memória: XMB"
"Uso de memória alto, considerando limpeza adicional"
```

### Monitor de Desenvolvimento

Em modo desenvolvimento, aparece um monitor no canto superior direito mostrando:

- Uso de memória de áudio (MB)
- Número de mensagens no contexto

## Benefícios

1. **Feedback Contínuo**: Dicas em tempo real durante a reunião
2. **Contexto Progressivo**: Cada dica considera todo o histórico
3. **Experiência Fluida**: Sem necessidade de intervenção manual
4. **Memória Controlada**: Sistema estável para sessões longas
5. **Análise Precisa**: Segmentos menores permitem melhor análise

## Solução de Problemas

### Problema: Sistema não inicia

- Verificar permissões de microfone e tela
- Verificar console para erros de API

### Problema: Memória alta

- Sistema fará limpeza automática
- Em casos extremos, reiniciar a sessão

### Problema: Dicas não aparecem

- Verificar se há áudio suficiente sendo capturado
- Verificar logs de transcrição no console

### Problema: Performance lenta

- Verificar uso de CPU durante transcrição
- Considerar reduzir SEGMENT_INTERVAL se necessário

## Personalização

Para ajustar o comportamento, modifique `AUDIO_PROCESSING_CONFIG`:

- **Intervalo mais rápido**: Reduza `SEGMENT_INTERVAL` para 15000 (15s)
- **Mais memória**: Aumente `MAX_AUDIO_SEGMENTS` para 100
- **Contexto maior**: Aumente `MAX_CONTEXT_MESSAGES` para 150
- **Limpeza mais frequente**: Reduza `CLEANUP_INTERVAL` para 120000 (2min)
