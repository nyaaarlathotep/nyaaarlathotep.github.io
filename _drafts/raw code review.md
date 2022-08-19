# ArrayList

## 数据结构

```
transient Object[] elementData;

private int size;
```



## add

```
    public boolean add(E var1) {
        this.ensureCapacityInternal(this.size + 1);
        this.elementData[this.size++] = var1;
        return true;
    }
```

`this.ensureCapacityInternal`保证长度，然后把值赋给数组。

## 扩容

```
    private void grow(int var1) {
        int var2 = this.elementData.length;
        int var3 = var2 + (var2 >> 1);
        if (var3 - var1 < 0) {
            var3 = var1;
        }

        if (var3 - 2147483639 > 0) {
            var3 = hugeCapacity(var1);
        }

        this.elementData = Arrays.copyOf(this.elementData, var3);
    }
```

每次扩容，增加自己原来长度的一半或者需要的长度，两者中选择较大的那个。

## remove

遍历，找到对应element的index，然后把[index+1]到[数组结束的位置]复制 到 [index]到[数组结束的位置-1]，同时this.size-1；

值得一提的是，所有的数组拷贝都用的是`System.arraycopy`这个native方法，拷贝源数组的一部分到目标数组。应该效率比较高吧。

## 内部类

### ArrayListSpliterator

用来给流用的子类，可以对遍历做更多控制和并发的一些处理。

### SubList

其中并没有额外的数据结构，而是与ArrayList共用，只是多了一个offset，一个parentOffset用来控制index。

之所以有两个offset，是因为有时候他会直接操作elementData，而有时候它又会使用ArrayList的接口

SubList还有属于自己的Iterator。

此外，还能从SubList中创建SubList，属实是套娃了。

### Itr

```
int cursor;
int lastRet = -1;
```

指针与上一次的指针，用来取外部类的elementData，当然，还有对应的检查。


### ListItr extends ArrayList\<E\>.Itr

比Itr多了个previous，可以找之前遍历过的元素了。

# HashMap

## 数据结构

```
    private static final long serialVersionUID = 362498820763181265L;
    static final int DEFAULT_INITIAL_CAPACITY = 16;
    static final int MAXIMUM_CAPACITY = 1073741824;
    // 负载因子默认值
    static final float DEFAULT_LOAD_FACTOR = 0.75F;
    // 链表红黑树转化临界值
    static final int TREEIFY_THRESHOLD = 8;
    // 红黑树转化为链表临界值(扩容后红黑数节点节点减少可能退化为链表)
    static final int UNTREEIFY_THRESHOLD = 6;
    // 限制树转化的最小table容量
    static final int MIN_TREEIFY_CAPACITY = 64;
    // **关键数据结构**，存放首节点的table，可能是红黑树的头节点，或者链表的头节点
    transient Node<K, V>[] table;
    transient Set<Map.Entry<K, V>> entrySet;
    transient int size;
    transient int modCount;
    int threshold;
    // 负载因子，决定了HashMap何时扩容
    final float loadFactor;
```

这是一篇讲loadFactor与TREEIFY_THRESHOLD的博客。

https://blog.csdn.net/reliveIT/article/details/82960063

## add

这张图逻辑很清楚了，不需要我补充了。

## 扩容

根据`this.threshold`和其他很多的信息，重新初始化一个table，将原来table里的元素rehash并放入新的table中，其中还涉及到红黑树的分裂等奇妙操作，子树可能会退化为链表。

## remove

根据hash从table里找，再根据节点是链表还是树做进一步的遍历寻找，找的到就移除并返回对应的Node的value，找不到就返回null。

## afterNodeAccess

此外，留空了这三个方法，他们分别在node的给定情况下被调用。可以用于子类重写，自定义功能，感觉可以实现很多，留下来的东西很方便啊。

```
void afterNodeAccess(Node<K, V> var1) {
}

void afterNodeInsertion(boolean var1) {
}

void afterNodeRemoval(Node<K, V> var1) {
}
```

## 内部类

### Node<K, V> implements Map.Entry<K, V>

链表节点

```
        final int hash;
        final K key;
        V value;
        Node<K, V> next;
```

### TreeNode<K, V> extends LinkedHashMap.Entry<K, V>

红黑数节点

值得一提的是，`LinkedHashMap.Entry<K, V> extends HashMap.Node<K, V>`，所以TreeNode仍然是Node的子类。当然，table是一个Node的数组，TreeNode能放进去也必然是Node，LinkedHashMap也是HashMap的子类，很怪很乱。

### abstract class HashIterator

写了一些公用的，迭代器方法的抽象子类。

是利用table，index来遍历的，而table中不是所有位置都有Node的。核心的遍历头节点的都是这一行代码：

```
while(this.index < table.length && (this.next = table[this.index++]) == null) {
}
```

下面几个子类都是依靠HashIterator的`nextNode()`方法的。

#### KeyIterator extends HashMap<K, V>.HashIterator implements Iterator\<K\> 

#### ValueIterator extends HashMap<K, V>.HashIterator implements Iterator\<V\>

#### EntryIterator extends HashMap<K, V>.HashIterator implements Iterator<Map.Entry<K, V>>

# LinkedHashMap

HashMap的子类，不同的关键是`Entry<K, V> extends HashMap.Node<K, V>`，重写了HashMap的Node，也就是Map的Entry，也不知道为啥名字变来变去。

## 数据结构

```
    transient Entry<K, V> head;
    transient Entry<K, V> tail;
    final boolean accessOrder;
```

多了head, tail, 还有一个标志位 accessOrder。

其他还有继承来自HashMap的，不重复说了。

## add

其实不能算add的变化，LinkedHashMap重写了HashMap的新建树节点和链表节点的方法，在每次新建节点之后，会给节点赋一下before和after，这样就能在之后有序遍历了。

```
   HashMap.Node<K, V> newNode(int var1, K var2, V var3, HashMap.Node<K, V> var4) {
        Entry var5 = new Entry(var1, var2, var3, var4);
        this.linkNodeLast(var5);
        return var5;
    }
    
    private void linkNodeLast(Entry<K, V> var1) {
        Entry var2 = this.tail;
        this.tail = var1;
        if (var2 == null) {
            this.head = var1;
        } else {
            var1.before = var2;
            var2.after = var1;
        }

    }
```

所以，LinkedHashMap的有序，实际是Node的有序，维护顺序的位置是新建节点之后，会对node的before和after赋值，如果是整个map的第一个节点，还会赋值`this.head`。

## remove

维护有序的方式与add的实现有点不同，重写了父类的空方法`afterNodeRemoval()`，在每移除节点后，会对节点的前后节点做一些处理。

## accessOrder

new LinkedHashMap的时候可以赋值，如果为true，则每次访问之后，会把被访问的节点的顺序提到最后，即，this.tail。

get与getOrDefault方法里，都有这么一段：

```
            ……
            if (this.accessOrder) {
                this.afterNodeAccess(var2);
            }
            ……


    void afterNodeAccess(HashMap.Node<K, V> var1) {
        Entry var2;
        if (this.accessOrder && (var2 = this.tail) != var1) {
            Entry var3 = (Entry)var1;
            Entry var4 = var3.before;
            Entry var5 = var3.after;
            var3.after = null;
            if (var4 == null) {
                this.head = var5;
            } else {
                var4.after = var5;
            }

            if (var5 != null) {
                var5.before = var4;
            } else {
                var2 = var4;
            }

            if (var2 == null) {
                this.head = var3;
            } else {
                var3.before = var2;
                var2.after = var3;
            }

            this.tail = var3;
            ++this.modCount;
        }

    }
```

### removeEldestEntry

此外还有一个留空的方法值的注意，removeEldestEntry

```
    void afterNodeInsertion(boolean var1) {
        Entry var2;
        if (var1 && (var2 = this.head) != null && this.removeEldestEntry(var2)) {
            Object var3 = var2.key;
            this.removeNode(hash(var3), var3, (Object)null, false, true);
        }

    }
```

LinkedHashMap重写了HashMap的afterNodeInsertion，在其中调用了removeEldestEntry，查了查发现这个东西可以很简单的做一个最近最少使用的Cache，只要写一个LinkedHashMap的子类，重写removeEldestEntry这个方法，按照自己的需要移除节点即可。

## 内部类

### Entry<K, V> extends HashMap.Node<K, V>

```
static class Entry<K, V> extends HashMap.Node<K, V> {
    Entry<K, V> before;
    Entry<K, V> after;

    Entry(int var1, K var2, V var3, HashMap.Node<K, V> var4) {
        super(var1, var2, var3, var4);
    }
```

before和after是当前节点的前后节点，如果没有对应的前后节点，就是null。在前面add和remove操作里会维护这些关系，保证了node的有序，也就是linkedHashMap的有序。

# ConcurrentHashMap

## 数据结构

```
    ……
    private static final float LOAD_FACTOR = 0.75F;
    static final int TREEIFY_THRESHOLD = 8;
    static final int UNTREEIFY_THRESHOLD = 6;
    static final int MIN_TREEIFY_CAPACITY = 64;
    
   
    // NCPU = Runtime.getRuntime().availableProcessors();
    // 由static初始化了很多值
    static final int NCPU;
    ……
    
    // 扩容标志位
    // ForwardingNode节点对应hash
    static final int MOVED = -1;
    // TreeBin节点对应hash
    static final int TREEBIN = -2;
    // ReservationNode节点对应hash
    static final int RESERVED = -3;
    // 普通节点对应hash
    static final int HASH_BITS = Integer.MAX_VALUE;
    
    // **关键数据结构**，存放节点的table
    // 可能存放的数据结构是Node(链表的头节点)
    // TreeBin(红黑数的假头节点，并不是红黑数节点TreeNode，会指向红黑数的头节点)
    // ForwardingNode(转发节点，表示当前表正在扩容，当前节点已经扩容完成，转发至nextable)
    // ReservationNode(compute与computeIfAbsent中用到的占位节点)
    transient volatile Node<K, V>[] table;
    // 正在扩容迁移的下一张表
    private transient volatile Node<K, V>[] nextTable;
    
    // 这几个值都是有关ConcurrentHashMap计算容量的
    private transient volatile long baseCount;
    private transient volatile int cellsBusy;
    private transient volatile CounterCell[] counterCells;
    
    // 显示map扩容与初始化的标志位
    private transient volatile int sizeCtl;
    // 多线程扩容时，table开始迁移的索引位置，由高位向低位
    private transient volatile int transferIndex;
    
    // 几个set，可以通过set直接操作map里的数据，remove之类的
    private transient KeySetView<K, V> keySet;
    private transient ValuesView<K, V> values;
    private transient EntrySetView<K, V> entrySet;
    
    // 支持cas的类，内部方法是native的，由虚拟机实现，这个类无法被实例化
    private static final Unsafe U;
```

这有一篇关于sizeCtl含义的文章：[ConcurrentHashMap的sizeCtl含义纠正](https://blog.csdn.net/Unknownfuture/article/details/105350537)

这有一篇关于ReservationNode bug的文章：[ConcurrentHashMap竟然也有死循环问题？](https://cloud.tencent.com/developer/article/1533786)

一些Hashap就有，并没有改变含义的属性未再次说明。


## get

```
    public V get(Object var1) {
        int var8 = spread(var1.hashCode());
        Node[] var2;
        Node var3;
        int var5;
        if ((var2 = this.table) != null && (var5 = var2.length) > 0 && (var3 = tabAt(var2, var5 - 1 & var8)) != null) {
            int var6;
            Object var7;
            if ((var6 = var3.hash) == var8) {
                if ((var7 = var3.key) == var1 || var7 != null && var1.equals(var7)) {
                    return var3.val;
                }
            } else if (var6 < 0) {
                Node var4;
                return (var4 = var3.find(var8, var1)) != null ? var4.val : null;
            }

            while((var3 = var3.next) != null) {
                if (var3.hash == var8 && ((var7 = var3.key) == var1 || var7 != null && var1.equals(var7))) {
                    return var3.val;
                }
            }
        }

        return null;
    }
```

1. 找到table，计算要get的key的hash
2. 如果对应的节点不为null
   1. 如果对应节点即我们需要的，则返回对应值
   2. 如果对应节点的hash<0，则调用对应节点的 `Node.find()`
      1. 根据节点实际的类型不同，Treebin/ForwardingNode/ReservationNode ，会有不同的方法找到对应节点
   3. 如果是链表，则遍历链表查找，返回找到的值
3. 返回null

```
        Node<K, V> find(int var1, Object var2) {
            Node var3 = this;
            if (var2 != null) {
                do {
                    Object var4;
                    if (var3.hash == var1 && ((var4 = var3.key) == var2 || var4 != null && var2.equals(var4))) {
                        return var3;
                    }
                } while((var3 = var3.next) != null);
            }

            return null;
        }
```

## add

```
    final V putVal(K var1, V var2, boolean var3) {
        if (var1 != null && var2 != null) {
            int var4 = spread(var1.hashCode());
            int var5 = 0;
            Node[] var6 = this.table;

            while(true) {
                int var8;
                // 初始化table
                while(var6 == null || (var8 = var6.length) == 0) {
                    var6 = this.initTable();
                }

                Node var7;
                int var9;
                if ((var7 = tabAt(var6, var9 = var8 - 1 & var4)) == null) {
                	// 尝试cas添加元素
                    if (casTabAt(var6, var9, (Node)null, new Node(var4, var1, var2, (Node)null))) {
                        break;
                    }
                } else {
                    int var10;
                    if ((var10 = var7.hash) == -1) {
                    	// 帮助扩容
                        var6 = this.helpTransfer(var6, var7);
                    } else {
                        Object var11 = null;
                        // 对table当前位置的元素加锁
                        synchronized(var7) {
                            if (tabAt(var6, var9) == var7) {
                                if (var10 < 0) {
                                	
                                    if (var7 instanceof TreeBin) {
                                    	// 树的情况
                                        var5 = 2;
                                        TreeNode var18;
                                        if ((var18 = ((TreeBin)var7).putTreeVal(var4, var1, var2)) != null) {
                                            var11 = var18.val;
                                            if (!var3) {
                                                var18.val = var2;
                                            }
                                        }
                                    }
                                } else {
                                	// 链表的情况
                                    label103: {
                                        var5 = 1;

                                        Node var13;
                                        Object var14;
                                        for(var13 = var7; var13.hash != var4 || (var14 = var13.key) != var1 && (var14 == null || !var1.equals(var14)); ++var5) {
                                            Node var15 = var13;
                                            if ((var13 = var13.next) == null) {
                                                var15.next = new Node(var4, var1, var2, (Node)null);
                                                break label103;
                                            }
                                        }

                                        var11 = var13.val;
                                        if (!var3) {
                                            var13.val = var2;
                                        }
                                    }
                                }
                            }
                        }

                        if (var5 != 0) {
                            if (var5 >= 8) {
                                this.treeifyBin(var6, var9);
                            }

                            if (var11 != null) {
                                return var11;
                            }
                            break;
                        }
                    }
                }
            }

            this.addCount(1L, var5);
            return null;
        } else {
            throw new NullPointerException();
        }
    
```

1. 找到table，计算即将添加的元素的hash
   1. 进入循环
   2. 判断table是否初始化，否则初始化
   3. 如果根据计算出的hash，找到table对应位置为null，则利用cas在对应位置添加节点，此时不会加锁，所以可能失败，但失败会重新开始循环，成功则break
   4. 准备添加元素
      1. 如果对应hash为`MOVED(-1)`，则在扩容，当前线程帮助扩容，调用`this.helpTransfer()`，结束后继续进行循环
      2. 对当前找到的头节点加锁，利用`synchronized`关键字
         1. 如果是`TreeBin`，树添加节点
         2. 否则，遍历至`node.next==null`，再添加`next`
      3. 检查长度，如果超了8，树化链表
      4. 如果是重复键，返回旧值
2. 调用`this.addCount()`增加size，这边还有复杂的逻辑防止冲突
3. 返回null

### 总结

1. 添加元素的主体是个循环，会因为各种情况到其他逻辑，在结束这些支路逻辑后，会再次尝试添加新元素
2. 真正添加的部分是对头节点加锁的

## 扩容

concurrentHashMap的扩容也是多线程的。每个线程负责table的一段进行扩容，默认最小是 16。如果大于 16 则根据当前 CPU 数来进行分配，最大参与扩容线程数不会超过 CPU 数。

**什么时候会触发扩容？**

1. 在调用 addCount 方法增加集合元素计数后发现当前集合元素个数到达扩容阈值时就会触发扩容
2. 扩容状态下其他线程对集合进行插入、修改、删除、合并、compute 等操作时遇到 ForwardingNode 节点会触发扩容
3. putAll 批量插入或者插入节点后发现存在链表长度达到 8 个或以上，但数组长度为 64 以下时会触发扩容

注意：桶上链表长度达到 8 个或者以上，并且数组长度为 64 以下时只会触发扩容而不会将链表转为红黑树 。



nextTable为下一个扩容中的下一个table，已经完成迁移的节点用ForwardingNode占位。迁移时会用`synchronized`对当前迁移的节点加锁

## remove

与add相似，循环，对头节点加锁，再操作对应的树或者链表的remove。

还要判断树的退化。

## 内部类

Node，TreeNode等与HashMap类似，不再做说明。

足足有3000行，我只能找几个重要的写一下了。

### static final class TreeBin<K, V> extends Node<K, V>

树的转发头节点，在table中占位。真正的红黑数节点是TreeNode

#### 数据结构

```
        TreeNode<K, V> root;
        volatile TreeNode<K, V> first;
        
        // 等待者线程（当前lockState是读锁状态）
        volatile Thread waiter;
        
        /**
        * 可能为很多状态，依靠位运算来判断状态，性能好，不易读
        * 1.写锁状态 写是独占状态，以散列表来看，真正进入到TreeBin中的写线程 同一时刻 只有一个线程
        * 2.等待者状态（写线程在等待），当TreeBin中有读线程目前正在读取数据时，写线程无法修改数据
        * 3.读锁状态 读锁是共享，同一时刻可以有多个线程 同时进入到 TreeBin对象中获取数据。 每一个线程 都会给 lockState + 4
        */
        volatile int lockState;
        static final int WRITER = 1; // 0b0001
        static final int WAITER = 2; // 0b0010
        static final int READER = 4; // 0b0100
        private static final Unsafe U;
        private static final long LOCKSTATE;

```

#### 竞争锁

在插入树节点某些情况下或者去除树节点某些情况的时候会调用`lockRoot()`

```
        private final void lockRoot() {
            if (!U.compareAndSwapInt(this, LOCKSTATE, 0, 1)) {
                this.contendedLock();
            }
        }

        private final void unlockRoot() {
            this.lockState = 0;
        }
```

```
 private final void contendedLock() {
     boolean waiting = false;
     for (int s;;) {
         // ~WAITER 将WAITER取其反码 0010 -> 1101
         // lockState & ~WAITER为0, 则当前锁状态为WAITER(读锁状态)
         if (((s = lockState) & ~WAITER) == 0) {
             // 将lockState更新为写锁状态, 0001
             if (U.compareAndSwapInt(this, LOCKSTATE, s, WRITER)) {
                 if (waiting)
                     waiter = null;
                 return;
             }
         }
         // lockState & WAITER为0, 则当前锁状态为读锁或写锁
         else if ((s & WAITER) == 0) {
             // 将lockState第二位置为1，即更新为0110或0011
             if (U.compareAndSwapInt(this, LOCKSTATE, s, s | WAITER)) {
                 waiting = true;
                 // 将等待者线程设置为当前线程
                 waiter = Thread.currentThread();
             }
         }
         // 如果waiting为true，也就是上次进入了第二个条件，已经将等待者线程设为了当前线程
         else if (waiting)
             // 当前线程挂起
             LockSupport.park(this);
     }
 }
```

### abstract static class BulkTask<K, V, R> extends CountedCompleter

public abstract class CountedCompleter extends ForkJoinTask

这是一个父类，有很多子类，分别对应不同的问题。由于ConcurrentHashMap可能并发，Map中很多函数式的接口的实现都得保证并发不出现问题，最后的解决方案是使用ForkJoin来保证并发任务的执行不出现问题。它的子类，例如：`static final class ForEachValueTask<K, V> extends BulkTask<K, V, Void>`

就可以遍历Value。

## size

    // 这几个值都是有关ConcurrentHashMap计算容量的
    private transient volatile long baseCount;
    // counterCells是否多线程的标志位
    private transient volatile int cellsBusy;
    private transient volatile CounterCell[] counterCells;

```
    public int size() {
        long var1 = this.sumCount();
        return var1 < 0L ? 0 : (var1 > 2147483647L ? Integer.MAX_VALUE : (int)var1);
    }
    
    final long sumCount() {
        CounterCell[] var1 = this.counterCells;
        long var3 = this.baseCount;
        if (var1 != null) {
            for(int var5 = 0; var5 < var1.length; ++var5) {
                CounterCell var2;
                if ((var2 = var1[var5]) != null) {
                    var3 += var2.value;
                }
            }
        }

        return var3;
    }
```

可以看到Map的size是`this.baseCount`加上了`this.counterCells`中每个CounterCell的value。

而addCount方法会更改`this.baseCount`或者`this.counterCells`

```
    private final void addCount(long var1, int var3) {
        CounterCell[] var4;
        long var5;
        long var7;
        int var12;
        // 尝试cas，更新this.baseCount
        if ((var4 = this.counterCells) != null || !U.compareAndSwapLong(this, BASECOUNT, var5 = this.baseCount, var7 = var5 + var1)) {
        	// 更新this.baseCount失败
            boolean var13 = true;
            CounterCell var9;
            long var10;
            // 尝试cas，更新CounterCell的value
            if (var4 == null || (var12 = var4.length - 1) < 0 || (var9 = var4[ThreadLocalRandom.getProbe() & var12]) == null || !(var13 = U.compareAndSwapLong(var9, CELLVALUE, var10 = var9.value, var10 + var1))) {
                // 当as数组为空
        		// 或者当as长度为0
        		// 或者当前线程对应的as数组桶位的元素为空
        		// 或者当前线程对应的as数组桶位不为空，但是累加失败

            	// 调用fullAddCount()
            	// 这边的逻辑也挺麻烦的，再经过一些尝试后可能再次回头尝试cas更新this.baseCount
                this.fullAddCount(var1, var13);
                return;
            }

            if (var3 <= 1) {
                return;
            }

            var7 = this.sumCount();
        }

		// 扩容的一些逻辑
        int var11;
        Node[] var14;
        if (var3 >= 0) {
            for(; var7 >= (long)(var12 = this.sizeCtl) && (var14 = this.table) != null && (var11 = var14.length) < 1073741824; var7 = this.sumCount()) {
                int var16 = resizeStamp(var11);
                if (var12 < 0) {
                    Node[] var15;
                    if (var12 >>> RESIZE_STAMP_SHIFT != var16 || var12 == var16 + 1 || var12 == var16 + MAX_RESIZERS || (var15 = this.nextTable) == null || this.transferIndex <= 0) {
                        break;
                    }

                    if (U.compareAndSwapInt(this, SIZECTL, var12, var12 + 1)) {
                        this.transfer(var14, var15);
                    }
                } else if (U.compareAndSwapInt(this, SIZECTL, var12, (var16 << RESIZE_STAMP_SHIFT) + 2)) {
                    this.transfer(var14, (Node[])null);
                }
            }
        }

    }
```

可以看到，尝试了两次cas，就是为了不加锁，这也导致最后尝试获得ConcurrentHashMap的size的时候要做一些额外的操作。
