# Lost in Translation: A Study of Bugs Introduced by Large Language Models while Translating Code

## RQ

- RQ1: Effectiveness in Code Translation (§3). 

  - (RQ1.1) How do state-of-the-art general and code LLMs perform in code translation?

  - (RQ1.2) What are the outcomes of unsuccessful translations?

- RQ2: LLM-Based Translation Bugs (§4). 

  - (RQ2.1) What are thedifferent types of underlying root causes (translation bugs) for unsuccessful translations? 

  - (RQ2.2) How prevalent are these bugs in unsuccessful translations? 

  - (RQ2.3) How do translation bugs in real-world projects differ from those in crafted benchmarks?

- RQ3: Comparison with Alternative Approaches (§5). How do state-of-the-art non-LLM-based techniques perform in code translation and what types of translation bugs do they introduce?
  
- RQ4: Mitigating Translation Bugs (§6). To what extent do the proposed prompt-crafting techniques resolve translation bugs?

## prompt

```
$SOURCE_CODE
// Unformatted source code
Translate the above
$SOURCE_LANG code to
$TARGET_LANG. Print only the
$TARGET_LANG code, end with
comment "|End-of-Code|".
```

## success criteria

We consider a translation successful if it compiles, passes runtime checks, and existing tests pass on the translated code. 

## findings

Some notable findings are: (1) identifying suitable data type in the target PL that preserves the source behavior is challenging, (2) identifying equivalent APIs in the target language or implementing the API functionality can introduce bugs, and (3) replacing language-specific features, such as method overloading and annotations, can be challenging, especially in real-world projects.

### Prevalence of LLM-based Translation Bugs

- Finding 1: More than one-third (33.5%) of the translation bugs are data-related bugs.
  - Finding 1a: Among the data-related bugs, most (54% of the data related bugs and 18.1% of the total bugs) are due to incorrect parsing of inputs.
  - Finding 1b: Choosing the correct data type in the target PL is a crucial step that accounts for 34.3% of all data-related bugs and 11.5% of all bugs.
- Finding 2: A significant proportion, 30.5%, of the translation bugs occur due to syntactic and semantic differences between the source and target PLs; almost 80% of these (24.3% of all bugs) are caused by violation of target language requirements.
  - Finding 2a: Replacing an API call with another API call in the target PL can result in bugs.
- Finding 3: 24.2% of the translation bugs are related to incorrect code logic and missing dependencies in the target PL, with missing imports being the dominant category.

### Translation Bugs in Real-world Projects

- Finding 4: Real-world applications pose complex challenges for code translation, such as handling method overloading, inheritance, and code annotations, not seen in crafted datasets.
- Finding 5: The effectiveness of code translation can vary considerably based on the characteristics of the source and target PLs, such as the type system, available programming APIs, metaprogramming support via decorators or annotations, etc.
- inding 6: Although the translation bug categories remain the same, occurrences of bug instances and their distribution vary between crafted benchmarks and real-world projects.

### LLM- VS. NON-LLM-BASED TRANSLATION

- Finding 7: For C to Go, the best-performing LLM, i.e., GPT-4, achieves 10% higher success rate than non-LLM-based approach, whereas, for C to Rust, the non-LLM-based approach translates 95% of the code (34% better than best-performing LLM).
- Finding 8: C2Rust generates non-idiomatic and unsafe code, whereas GPT-4 tends to generate safer and idiomatic code.

## MITIGATING TRANSLATION BUGS

针对 bug 的种类做提示词。

### Prompt Crafting

### Iterative Translation Bug Mitigation

we propose an iterative prompting approach. Our hypothesis is that providing more context information to LLMs can help generate better code

## 讨论

### 优缺点

- **非 LLM - Based 方法**：具有更全面的应用上下文，确定性更强，但生成的代码可能不够自然。
- **LLM - Based 方法**：具有更大的创造性，生成的代码更自然，但上下文信息有限且具有概率性。

**实际项目翻译的挑战和方向**：实际项目翻译需要处理文件间的依赖关系、API 调用和不同编程语言的 API 生态差异等问题。可以利用程序分析和程序分解技术来提供更多上下文信息。

- **改进 LLMs 的方向**：对于闭源模型（如 GPT - 4），可以改进提示策略；对于开源 LLMs，可以通过微调来提高性能。

# Type-migrating C-to-Rust translation using a large language model

- RQ1. Promotion of type migration: Does the proposed approach effectively promote type migration by generating candidate signatures? (Section 4.3)

- RQ2. Quality of type migration: Do the Rust types introduced by the proposed approach adhere to Rust idioms? (Section 4.4)

- RQ3. Type error reduction: Does the proposed approach effectively reduce type errors by augmenting functions and iteratively fixing errors? (Section 4.5)
-  RQ4. Comparison with existing approaches: How does the translation of the proposed approach differ from that of the existing approaches? (Section 4.6)
-  RQ5. Overhead: Does the proposed approach entail reasonable overhead? (Section 4.7)
